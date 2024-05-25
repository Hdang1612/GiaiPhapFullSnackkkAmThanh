// src/VideoRecorder.js
import React, { useRef, useState, useEffect } from 'react';
import { Button, Layout, Typography, message,Table } from 'antd';
const { Content } = Layout;
const { Title } = Typography;
const VideoRecorder = () => {
  const videoRef = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const chunksRef = useRef([]);
  const columns=[
    {
      title: "STT",
      render: (text, record, index) => <span>{index + 1}</span>,
    },
    {
      title: "Mã record ",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Hành dộng",
      dataIndex: "suggestContent",
      key: "suggestContent",
    },
    {
      title: "Tên file record ",
      dataIndex: "filename",
      key: "filename",
    },
    {
      title: "Ngày tạo ",
      dataIndex: "quantity",
      key: "quantity",
      // render: (createdAtArray) => {
      //   const formatDateTimeFromArray = (createdAtArray) => {
      //     const date = new Date(
      //       createdAtArray[0],
      //       createdAtArray[1] - 1,
      //       createdAtArray[2],
      //       createdAtArray[3],
      //       createdAtArray[4],
      //       createdAtArray[5]
      //     );
      //     const hours = date.getHours().toString().padStart(2, '0');
      //     const minutes = date.getMinutes().toString().padStart(2, '0');
      //     const seconds = date.getSeconds().toString().padStart(2, '0');
      //     const day = date.getDate();
      //     const month = date.getMonth() + 1;
      //     const year = date.getFullYear();
      //     return `${hours}:${minutes}:${seconds} ngày ${day} tháng ${month} năm ${year}`;
      //   };
  
      //   const formattedDateTime = formatDateTimeFromArray(createdAtArray);
        
      //   return formattedDateTime;
      // },
    },
  ];
  

  // useEffect(() => {
  //   const fetchRecordList = async () => {
  //     try {
  //       const response = await fetch('http://record-app.us-east-1.elasticbeanstalk.com/records');
  //       if (response.ok) {
  //         const data = await response.json();
  //         setListRecord(data);
  //       } else {
  //         console.error('Failed to fetch record list:', response.statusText);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching record list:', error);
  //     }
  //   };

  //   fetchRecordList();
  // }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        startWebcam(stream);
      } catch (err) {
        console.log("Error retrieving a media device.");
        console.log(err);
      }
    };

    const startWebcam = (stream) => {
      window.stream = stream;
      videoRef.current.srcObject = stream;
    };

    init();

    return () => {
      if (window.stream) {
        window.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  

  const handleDataAvailable = (event) => {
    if (event.data && event.data.size > 0) {
      chunksRef.current.push(event.data);
    }
  };

  const startRecording = () => {
    if (videoRef.current.srcObject === null) {
      videoRef.current.srcObject = window.stream;
    }
    const newMediaRecorder = new MediaRecorder(window.stream, { mimeType: 'video/webm' });
    newMediaRecorder.ondataavailable = handleDataAvailable;
    newMediaRecorder.onstop = handleStop;
    newMediaRecorder.start();
    setMediaRecorder(newMediaRecorder);
    setRecording(true);
    chunksRef.current = []; // Clear previous chunks
    console.log("Started recording");
  };

  const handleStop = () => {
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    console.log(blob)
    setVideoBlob(blob);
    console.log("Stopped recording");
  };


  const uploadVideo = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'newrecorded-video.webm');
    formData.append('suggestId', '3');
    try {
      const response = await fetch(`http://record-app.us-east-1.elasticbeanstalk.com/records`, {
        method: 'POST',
        headers: {
          Accept: "*/*",
        },
        body: formData,
      });

      if (response.ok) {
        console.log('Video uploaded successfully!');
      } else {
        console.error('Failed to upload video.');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    if (videoBlob) {
      uploadVideo(videoBlob);
    }
  }, [videoBlob]);

  const handleButtonClick = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
   
    <div>
      <video ref={videoRef} autoPlay></video>
      <button onClick={handleButtonClick} disabled={uploading}>
        {recording ? "Stop and Upload" : "Start Recording"}
      </button>
      {uploading && <span>Uploading...</span>}
    </div>
  );
};

export default VideoRecorder;
