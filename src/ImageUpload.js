import { useState } from "react";
import "./ImageUpload.css";
import { Button } from "@material-ui/core";
import { storage, db } from "./firebase";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import firebase from "firebase";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const ImageUpload = ({ username, openUpload, setOpenUpload }) => {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [progress, setProgress] = useState(0);

  const handleChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // progress function
        const progress =
          Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        //   error function
        console.log(error);
        alert(error.message);
      },
      () => {
        //   complete function
        storage
          .ref("images")
          .child(image.name)
          .getDownloadURL()
          .then((url) => {
            db.collection("posts").add({
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              caption,
              imageUrl: url,
              username,
            });
          });

        setProgress(0);
        setImage(null);
        setCaption("");
        setOpenUpload(false);
      }
    );
  };

  return (
    // <div className="ImageUpload">
    //   <progress value={progress} max="100" />
    //   <input
    //     className="ImageUpload__caption"
    //     type="text"
    //     value={caption}
    //     onChange={(e) => setCaption(e.target.value)}
    //     placeholder="Enter a caption..."
    //   />
    //   <input type="file" onChange={handleChange} />
    //   <Button onClick={handleUpload}>Upload</Button>
    // </div>
    <Modal open={openUpload} onClose={() => setOpenUpload(false)}>
      <div style={modalStyle} className={`ImageUpload ${classes.paper}`}>
        <progress
          className="ImageUpload__progress"
          value={progress}
          max="100"
        />
        <input
          className="ImageUpload__caption"
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Enter a caption..."
        />
        <input type="file" onChange={handleChange} />
        <Button onClick={handleUpload}>Upload</Button>
      </div>
    </Modal>
  );
};

export default ImageUpload;
