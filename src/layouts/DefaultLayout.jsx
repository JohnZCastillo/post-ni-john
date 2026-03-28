import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useParams, useNavigate, useLocation } from "react-router";
import { md5 } from 'js-md5';
import { updateContent } from "../redux-slice/slice";
import * as jsondiffpatch from 'jsondiffpatch';
import { v4 } from "uuid";

export default function DefaultLayout() {

    const initalState = useRef({
        clientId: v4(),
        firstRender: true,
        shouldReflect: false
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const appState = useSelector((state) => state.appState);

    useEffect(() => {
        const isAuthRoute = ['/login', '/workspaces'].includes(location.pathname);
        if (!appState.workspaceId && !isAuthRoute) {
            navigate('/workspaces');
        }
    }, [appState.workspaceId, location.pathname]);

    const socketRef = useRef();

    const syncUpstream = async (workspace) => {

        const response = await fetch(`${import.meta.env.VITE_WEB_AGENT}/sync/${workspace}`, {
            method: 'POST',
            body: JSON.stringify({
                content: appState.content
            })
        })
            .then(res => res.json());

        const localCopy = [...response.content];

        const diffpatcher = jsondiffpatch.create({
            objectHash: function (obj) {
                return obj.id;
            },
        });

        const delta = diffpatcher.diff(localCopy, appState.content);

        if (delta) {
            jsondiffpatch.patch(localCopy, delta);
        }

        dispatch(updateContent({ content: localCopy ?? [], isUpstream: true }))
    }

    const syncDownstream = async (workspace) => {

        const result = await fetch(`${import.meta.env.VITE_WEB_AGENT}/sync/${workspace}`)
            .then(response => response.json());

        const localHash = md5(JSON.stringify(appState.content ?? []));

        if (result.hash != localHash || 1 == 1) {

            const localCopy = jsondiffpatch.clone(appState.content);

            const diffpatcher = jsondiffpatch.create({
                objectHash: function (obj) {
                    return obj.id
                },
            });

            const delta = diffpatcher.diff(localCopy, result.data);

            if (delta) {
                console.log(delta);
                jsondiffpatch.patch(localCopy, delta);
            }

            dispatch(updateContent({ content: localCopy }))
        }
    }

    const syncDown = async (data) => {

        const diffpatcher = jsondiffpatch.create({
            objectHash: function (obj) {
                return obj.id
            },
        });

        const localCopy = diffpatcher.clone(appState.content);

        const delta = diffpatcher.diff(localCopy, data);

        if (delta) {
            diffpatcher.patch(localCopy, delta);
        }

        dispatch(updateContent({ content: localCopy }))
    }

    useEffect(() => {

        if (appState.workspaceId == null) {
            return
        }

        const token = localStorage.getItem(`ws:${appState.workspaceId}`);

        const wsUrl = `ws://localhost:3000/ws/${appState.workspaceId}${token ? `?token=${token}` : ''}`;

        const ws = new WebSocket(wsUrl)

        socketRef.current = ws;

        ws.onmessage = (event) => {

            const { clientId: targetId, content = [], initial = false } = JSON.parse(event.data);

            if (targetId == initalState.current.clientId) {
                return;
            }

            initalState.current.shouldReflect = false;

            syncDown(content)
        }

        return () => {
            if (ws.readyState) {
                ws.close();
            }
        }

    }, [appState.workspaceId])

    useEffect(() => {

        const ignoreActions = [
            'removeSelection',
            'setSelection',
            'setSelection'
        ];

        if (initalState.current.firstRender) {

            initalState.current = {
                ...initalState.current,
                firstRender: false
            }

            return;
        }

        const ws = socketRef.current;

        if (!ws?.readyState) {
            return;
        }


        if (ignoreActions.includes(appState.actionType)) {
            return;
        }


        if (!initalState.current.shouldReflect) {
            initalState.current.shouldReflect = true;
            return;
        }

        ws.send(JSON.stringify({
            clientId: initalState.current.clientId,
            content: appState.content
        }))

    }, [appState])

    return <>
        <Outlet context={{ syncUpstream, syncDownstream }} />
    </>
}