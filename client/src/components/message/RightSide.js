import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { addMessage, deleteConversation, getMessages, loadMoreMessages } from '../../redux/actions/messageAction';
import { imageUpload } from '../../utils/imageUpload';
import Icons from '../Icons';
import UserCard from '../UserCard';
import MsgDisplay from './MsgDisplay';

const RightSide = () => {
  const { auth, message, socket } = useSelector((state) => state);
  const dispatch = useDispatch();

  const { id } = useParams();
  const [user, setUser] = useState([]);
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const refDisplay = useRef();
  const pageEnd = useRef();
  const [data, setData] = useState([]);
  const [result, setResult] = useState(9);
  const [page, setPage] = useState(0);
  const [isLoadMore, setIsLoadMore] = useState(0);
  const history = useHistory();
  useEffect(() => {
    const newData = message.data.find((item) => item._id === id);
    if (newData) {
      setData(newData.messages);
      setResult(newData.result);
      setPage(newData.page);
    }
  }, [message.data, id]);
  useEffect(() => {
    if (id && message.users.length > 0) {
      setTimeout(() => {
        refDisplay.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);
      const newUser = message.users.find((user) => user._id === id);
      if (newUser) setUser(newUser);
    }
  }, [message.users, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && media.length === 0) return;
    setText('');
    setMedia([]);

    let newArr = [];
    if (media.length > 0) newArr = await imageUpload(media);
    const msg = {
      sender: auth.user._id,
      recipient: id,
      text,
      media: newArr,
      createdAt: new Date().toISOString(),
    };

    await dispatch(addMessage({ msg, auth, socket }));
    if (refDisplay.current) {
      refDisplay.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };
  useEffect(() => {
    const getMessagesData = async () => {
      if (message.data.every((item) => item._id !== id)) {
        await dispatch(getMessages({ auth, id }));
        setTimeout(() => {
          refDisplay.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
          });
        }, 50);
      }
    };
    getMessagesData();
  }, [id, dispatch, auth, message.data]);
  // Load More
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoadMore((p) => p + 1);
        }
      },
      {
        threshold: 0.1,
      },
    );
    observer.observe(pageEnd.current);
  }, [setIsLoadMore]);
  useEffect(() => {
    if (isLoadMore > 1) {
      if (result >= page * 9) {
        dispatch(loadMoreMessages({ auth, id, page: page + 1 }));
        setIsLoadMore(1);
      }
    }
    // eslint-disable-next-line
  }, [isLoadMore]);
  const handleDeleteConversation = () => {
    if (window.confirm('Bạn muốn xoá đoạn chat này ?')) {
      dispatch(deleteConversation({ auth, id }));
      return history.push('/message');
    }
  };

  return (
    <>
      <div className="message_header" style={{ cursor: 'pointer' }}>
        {user.length !== 0 && (
          <UserCard user={user}>
            <div>
              <div className="btn btn-warning mr-2" onClick={handleDeleteConversation}>
                Xoá đoạn chat
              </div>
            </div>
          </UserCard>
        )}
      </div>
      <div className="chat_container" style={{ height: media.length > 0 ? 'calc(100% - 180px)' : '' }}>
        <div className="chat_display" ref={refDisplay}>
          <button style={{ marginTop: '-25px', opacity: 0 }} ref={pageEnd}>
            Xem Thêm
          </button>
          {data.map((msg, index) => (
            <div key={index}>
              {msg.sender !== auth.user._id && (
                <div className="chat_row other_message">
                  <MsgDisplay user={user} msg={msg} />
                </div>
              )}
              {msg.sender === auth.user._id && (
                <div className="chat_row you_message">
                  <MsgDisplay user={auth.user} msg={msg} data={data} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form className="chat_input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Aa"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            border: 'none',
            borderRadius: '50px',
            padding: '6px 10px',
            backgroundColor: '#F0F2F5',
            height: '35px',
          }}
        />

        <Icons setContent={setText} content={text} />

        <button type="submit" className="material-icons" disabled={text ? false : true}>
          send
        </button>
      </form>
    </>
  );
};
export default RightSide;
