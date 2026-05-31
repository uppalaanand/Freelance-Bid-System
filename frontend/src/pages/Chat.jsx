import React, { useEffect, useState, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  HiPaperAirplane,
  HiOutlineChatAlt2,
  HiOutlineDotsVertical,
  HiUser,
  HiChevronLeft,
} from 'react-icons/hi';
import {
  fetchChats,
  fetchMessages,
  sendMessage,
  setActiveChat,
  clearMessages,
} from '../redux/slices/chatSlice';
import { SocketContext } from '../context/SocketContext';
import {
  Avatar,
  Button,
  Spinner,
  EmptyState,
} from '../components/common';

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { chats, activeChat, messages, isLoading } = useSelector((state) => state.chat);
  const { socket, joinChat, sendSocketMessage, emitTyping, emitStopTyping } = useContext(SocketContext);

  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { content: '' },
  });
  const messageContent = watch('content');

  // Load initial chats
  useEffect(() => {
    dispatch(fetchChats());
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  // Fetch messages when activeChat changes
  useEffect(() => {
    if (activeChat) {
      dispatch(fetchMessages(activeChat._id));
      joinChat(activeChat._id);
      setIsOtherTyping(false);
      setShowMobileList(false);
    }
  }, [activeChat, dispatch]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  // Handle typing listeners
  useEffect(() => {
    if (!socket || !activeChat) return;

    const handleTyping = (chatId) => {
      if (chatId === activeChat._id) {
        setIsOtherTyping(true);
      }
    };

    const handleStopTyping = (chatId) => {
      if (chatId === activeChat._id) {
        setIsOtherTyping(false);
      }
    };

    socket.on('typing', handleTyping);
    socket.on('stop-typing', handleStopTyping);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('stop-typing', handleStopTyping);
    };
  }, [socket, activeChat]);

  // Send typing events on typing
  useEffect(() => {
    if (messageContent && activeChat) {
      emitTyping(activeChat._id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(activeChat._id);
      }, 2000);
    }
  }, [messageContent, activeChat]);

  const getOtherParticipant = (chat) => {
    if (!chat || !chat.participants) return null;
    return chat.participants.find((p) => p._id !== user?._id) || chat.participants[0];
  };

  const onSendMessage = async (data) => {
    if (!data.content.trim() || !activeChat) return;
    emitStopTyping(activeChat._id);
    const resultAction = await dispatch(sendMessage({ chatId: activeChat._id, content: data.content }));
    if (sendMessage.fulfilled.match(resultAction)) {
      sendSocketMessage(resultAction.payload.message);
      reset({ content: '' });
    }
  };

  const handleSelectChat = (chat) => {
    dispatch(setActiveChat(chat));
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
      {/* Chats List Panel */}
      <div
        className={`${
          showMobileList ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-96 border-r border-slate-200 bg-white`}
      >
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineChatAlt2 className="text-indigo-600 h-6 w-6" /> Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading && chats.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : chats.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={HiOutlineChatAlt2}
                title="No conversations yet"
                description="When you start bid discussions or communicate with clients/students, they will show up here."
              />
            </div>
          ) : (
            chats.map((chat) => {
              const otherUser = getOtherParticipant(chat);
              const isActive = activeChat?._id === chat._id;
              return (
                <button
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                    isActive
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <Avatar src={otherUser?.avatar} name={otherUser?.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {otherUser?.name || 'User'}
                      </span>
                      <span className="text-xxs text-slate-400">
                        {chat.lastMessageAt
                          ? new Date(chat.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    {chat.project && (
                      <p className="text-xs text-indigo-600 font-medium truncate mb-1">
                        {chat.project.title}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 truncate">
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Conversation Feed */}
      <div
        className={`${
          showMobileList ? 'hidden' : 'flex'
        } md:flex flex-col flex-1 bg-slate-50 relative`}
      >
        {activeChat ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                >
                  <HiChevronLeft className="h-6 w-6" />
                </button>
                <Avatar
                  src={getOtherParticipant(activeChat)?.avatar}
                  name={getOtherParticipant(activeChat)?.name}
                  size="md"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {getOtherParticipant(activeChat)?.name}
                  </h3>
                  {activeChat.project && (
                    <span className="text-xs font-medium text-slate-400 block truncate max-w-[200px] md:max-w-md">
                      Project: <span className="text-indigo-600 font-semibold">{activeChat.project.title}</span>
                    </span>
                  )}
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <HiOutlineDotsVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[70%]">
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                      <span className={`text-[10px] text-slate-400 mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isOtherTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-200 text-slate-600 px-4 py-2 rounded-2xl rounded-tl-none text-xs flex items-center gap-1">
                    <span className="font-semibold">{getOtherParticipant(activeChat)?.name}</span> is typing
                    <span className="flex gap-0.5 ml-1">
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <form
              onSubmit={handleSubmit(onSendMessage)}
              className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                {...register('content', { required: true })}
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
              />
              <Button type="submit" variant="primary" className="h-10 w-10 !p-0 flex items-center justify-center rounded-xl">
                <HiPaperAirplane className="h-5 w-5 rotate-90 text-white" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={HiOutlineChatAlt2}
              title="No Conversation Selected"
              description="Choose a contact from the list on the left to view and send messages."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
