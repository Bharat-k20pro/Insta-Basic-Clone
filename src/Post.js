import { useEffect, useState } from "react";
import "./Post.css";
import Avatar from "@material-ui/core/Avatar";
import firebase from "firebase";
import { db } from "./firebase";

const Post = (props) => {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    let unsubscribe;
    if (props.postId) {
      unsubscribe = db
        .collection("posts")
        .doc(props.postId)
        .collection("comments")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          setComments(snapshot.docs.map((doc) => doc.data()));
        });
    }

    return () => {
      unsubscribe();
    };
  }, [props.postId]);

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    db.collection("posts").doc(props.postId).collection("comments").add({
      text: comment,
      username: props.user.displayName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setComment("");
  };

  return (
    <div className="post">
      <div className="post__header">
        <Avatar
          className="post__avatar"
          src="logo512.png"
          alt={props.username}
        />
        <h3>{props.username}</h3>
      </div>

      {/* header -> avatar + username */}

      <img className="post__image" src={props.imageUrl} />

      {/* image */}

      <h4 className="post__text">
        <strong>{props.username}</strong> {props.caption}
      </h4>

      {/* username + caption */}

      <div className="post__comments">
        {comments.map((comment) => (
          <p>
            <strong>{comment.username} </strong>
            {comment.text}
          </p>
        ))}
      </div>

      {props.user?.displayName && (
        <form className="post__commentBox">
          <input
            className="post__commentBox__input"
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter a comment..."
          />
          <button
            className="post__commentBox__button"
            onClick={handleCommentSubmit}
          >
            Post
          </button>
        </form>
      )}
    </div>
  );
};

export default Post;
