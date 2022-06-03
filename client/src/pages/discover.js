import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDiscoverPosts, DISCOVER_TYPES } from '../redux/actions/discoverAction';
import LoadIcon from '../assets/images/loading.gif';
import PostThumb from '../components/PostThumb';
import LoadMoreBtn from '../components/button/LoadMoreBtn';
import { getDataAPI } from '../utils/fetchData';
import Helmet from '../components/Helmet';

const Discover = () => {
  const { auth, discover } = useSelector((state) => state);
  const dispatch = useDispatch();

  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (!discover.firstLoad) {
      dispatch(getDiscoverPosts(auth.token));
    }
  }, [dispatch, auth.token, discover.firstLoad]);

  const handleLoadMore = async () => {
    setLoad(true);
    const res = await getDataAPI(`post_discover?num=${discover.page * 9}`, auth.token);
    dispatch({ type: DISCOVER_TYPES.UPDATE_POST, payload: res.data });
    setLoad(false);
  };

  return (
    <Helmet title="Khám phá">
      <div className="main">
        {discover.loading ? (
          <img src={LoadIcon} alt="loading" className="d-block mx-auto my-4" />
        ) : (
          <PostThumb posts={discover.posts} result={discover.result} />
        )}

        {load && <img src={LoadIcon} alt="loading" className="d-block mx-auto" />}

        {!discover.loading && (
          <LoadMoreBtn result={discover.result} page={discover.page} load={load} handleLoadMore={handleLoadMore} />
        )}
      </div>
    </Helmet>
  );
};

export default Discover;