// src/VideoRecorder.js
import React, { useRef, useState, useEffect } from 'react';
import { Button, Layout, Typography, message,Table,Space ,Flex,Modal,Spin,Drawer} from 'antd';
import {
  LoadingOutlined
} from "@ant-design/icons";
import { ImBin } from "react-icons/im";
const { Content } = Layout;
const { Title } = Typography;

const VideoRecorder = () => {
  const videoRef = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const chunksRef = useRef([]);
  const [listRecord,setListRecord]=useState([])
  const [listSuggest,setListSuggest]=useState([])
  const [currentSuggest, setCurrentSuggest] = useState(null);
  const [confirmDelete,setConfirmDelete]=useState(false)
  const [deletingRecord,setDeletingRecord]=useState(null)
  const [viewRecord, setViewRecord] = useState(null)
  const [loadingView, setLoadingView] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [viewList,setViewList]=useState(false)
  const [viewDetail,setViewDetail]=useState(false)
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [key, setKey] = useState(0);
  const [record,setRecord]=useState([])
  const videoRecordedRef = useRef();
  const deleteAction = (record) => {
    setConfirmDelete(!confirmDelete);
    setDeletingRecord(record);
  };

  const viewAction = (record) => {
    console.log(record?.filename)
    setVideoUrl(`http://record-app.us-east-1.elasticbeanstalk.com/videos/${record.filename}?${Date.now()}`);
    setKey(prevKey => prevKey + 1);
    setVideoModalVisible(true);
  };

  useEffect(() => {    
    videoRecordedRef.current?.load();
  }, [videoUrl]);

  const handleViewList = () => {
    setViewList(!viewList);
  };
  const columns=[
    {
      title: "STT",
      render: (text, record, index) => <span>{index + 1}</span>,
    },
    // {
    //   title: "Mã record ",
    //   dataIndex: "id",
    //   key: "id",
    // },
    {
      title: "Hành dộng",
      dataIndex: "suggestContent",
      key: "suggestContent",
    },
    {
      title: "Tên file record ",
      dataIndex: "filename",
      key: "filename",
      ellipsis: true,
      // width:180,
      render: (text, record) => (
        <Button
          style={{ textDecoration: "none", color: "#46B91D", fontWeight: 500 , border:'none',padding:0}}
          onClick={() => viewAction(record)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Ngày tạo ",
      dataIndex: "createAt",
      key: "createAt",
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
    {
      title: "Thao tác",
      align: "center",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            style={{ border: "none", backgroundColor: "transparent" }}
            icon={<ImBin />}
            onClick={() => deleteAction(record)}
          />
        </Space>
      ),
    },
  ];
  

  useEffect(() => {
    const fetchRecordList = async () => {
      try {
        const response = await fetch('http://record-app.us-east-1.elasticbeanstalk.com/records');
        if (response.ok) {
          const data = await response.json();
          setListRecord(data);
        } else {
          console.error('Failed to fetch record list:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching record list:', error);
      }
    };
    const fetchSuggestList = async () => {
      try {
        const response = await fetch('http://record-app.us-east-1.elasticbeanstalk.com/suggests');
        if (response.ok) {
          const data = await response.json();
          setListSuggest(data);
          setCurrentSuggest(data[Math.floor(Math.random() * data.length)]);
        } else {
          console.error('Failed to fetch record list:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching record list:', error);
      }
    };

    fetchSuggestList();
    fetchRecordList();
  }, [record]);

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
  
  // useEffect(() => {
  //   if (videoModalVisible) {
  //     setVideoUrl('');
  //   }
  // }, [videoModalVisible]);

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
    formData.append('suggestId', currentSuggest?.id);
    try {
      const response = await fetch(`http://record-app.us-east-1.elasticbeanstalk.com/records`, {
        method: 'POST',
        headers: {
          Accept: "*/*",
        },
        body: formData,
      });
      const newRecord = await response.json();
        setRecord([...record, newRecord]);
      if (response.ok) {
        console.log('Video uploaded successfully!');
      } else {
        console.error('Failed to upload video.');
      }
    } 
    catch (error) {
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

  const handleSkip = () => {
    const randomSuggest = listSuggest[Math.floor(Math.random() * listSuggest.length)];
    setCurrentSuggest(randomSuggest);
  };

  const deleteConfirm = async () => {
    setLoadingDelete(true);
    try {
      const response = await fetch(
        `http://record-app.us-east-1.elasticbeanstalk.com/records/${deletingRecord.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const newData = listRecord.filter((item) => item.id !== deletingRecord.id);
      setListRecord(newData);
      setConfirmDelete(!confirmDelete);
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setLoadingDelete(false);
      message.success("Xóa thành công!");
    }
  };

  return (
   
    <Flex align='center'>
      <div >
      <video ref={videoRef} autoPlay></video>
      {currentSuggest && (
        <div >
          <p>{currentSuggest.content}</p>
          <Flex justify='center'>
          <button style={{marginRight:12}} onClick={handleButtonClick} disabled={uploading}>
            {recording ? "Dừng và lưu" : "Bắt đầu ghi"}
          </button>
          <button style={{marginRight:12}} onClick={handleSkip} disabled={recording || uploading}>
            Bỏ qua
          </button>
          <button style={{marginRight:12}} onClick={handleViewList} >
            Xem danh sách bản ghi
          </button>
          </Flex>
        </div>
      )}
      {uploading && <span>Uploading...</span>}
      </div>
      <Drawer
      title="Danh sách bản ghi"
      onClose={handleViewList}
      open={viewList}
      width={1000}>
         <Table style={{height:'90%'}} columns={columns} dataSource={listRecord} pagination={{
                  pageSize: 5,
                }}/>
      </Drawer>
      <Modal
            width={400}
            title={<div style={{ textAlign: "center" }}>Xác nhận xóa</div>}
            open={confirmDelete}
            onOk={deleteConfirm}
            onCancel={deleteAction}
            footer={[
              <div style={{ textAlign: "center", width: "100%" }}>
                <Button
                  key="cancel"
                  onClick={deleteAction}
                  style={{ marginRight: 8 }}
                >
                  Cancel
                </Button>
                <Button key="ok" type="primary" onClick={deleteConfirm}>
                  {loadingDelete ? (
                    <Spin
                      indicator={
                        <LoadingOutlined
                          style={{ fontSize: 24, color: "#fff" }}
                          spin
                        />
                      }
                    />
                  ) : (
                    "Ok"
                  )}
                </Button>
              </div>,
            ]}
          ></Modal>
     <Modal
        title="Xem video"
        visible={videoModalVisible}
        footer={null}
        onCancel={() => setVideoModalVisible(false)}
        width={800}
        afterClose={() => setVideoUrl('')}
      >
        <Typography>{videoUrl}</Typography>
        <video ref={videoRecordedRef} controls width="100%">
          <source  key={key} src={videoUrl} type="video/webm" />
          Your browser does not support the video tag.
        </video>
        
      </Modal>
            
    </Flex>
  );
};

export default VideoRecorder;
