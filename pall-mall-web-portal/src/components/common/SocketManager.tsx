import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { disconnectSocket } from '@/features/messages/thunks';
import { initializeSocket } from '@/features/messages/socketThunks';
import { receiveMessage } from '@/features/messages/slice';

const SocketManager = () => {
    const dispatch = useAppDispatch();
    const accessToken = useAppSelector((state) => state.auth.accessToken);

    useEffect(() => {
        if (accessToken) {
            dispatch(initializeSocket());

            // Listen for incoming messages
            // Accessing socket instance directly might be tricky if not exposed
            // But initializeSocket sets it up. We need a way to listen.
            // Better approach: listen in the thunk or service, OR here if we can access the service.
            // Since socketService is a singleton, we can use it.
            import("@/services/socket/socket.service").then(({ socketService }) => {
                socketService.socket?.on("receive_message", (data: any) => {
                    console.log("Socket received message:", data);
                    dispatch(receiveMessage(data));
                });
            });

        } else {
            dispatch(disconnectSocket());
        }

        return () => {
            import("@/services/socket/socket.service").then(({ socketService }) => {
                socketService.socket?.off("receive_message");
            });
        };
    }, [dispatch, accessToken]);

    return null;
};

export default SocketManager;
