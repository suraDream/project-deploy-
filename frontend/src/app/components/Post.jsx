"use client";

import { useState, useEffect } from "react";
import "@/app/css/postField.css";

const CreatePost = ({ fieldId, onPostSuccess }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [startProcessLoad, SetstartProcessLoad] = useState(false);

  const MAX_FILE_SIZE = 8 * 1024 * 1024;
  const MAX_FILES = 10;

  const handleFileChange = (e) => {
    const files = e.target.files;
    const validFiles = [];
    let isValid = true;

    if (files.length + images.length > MAX_FILES) {
      setMessage(`คุณสามารถอัพโหลดได้สูงสุด ${MAX_FILES} รูป`);
      setMessageType("error");
      e.target.value = null;
      return;
    }

    for (let file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setMessage("ไฟล์รูปภาพมีขนาดใหญ่เกินไป (สูงสุด 8MB)");
        setMessageType("error");
        isValid = false;
        break;
      }

      if (file.type.startsWith("image/")) {
        const isDuplicate = images.some(
          (existingFile) => existingFile.name === file.name
        );
        if (!isDuplicate) {
          validFiles.push(file);
        }
      } else {
        setMessage("โปรดเลือกเฉพาะไฟล์รูปภาพเท่านั้น");
        setMessageType("error");
        isValid = false;
        break;
      }
    }

    if (isValid) {
      setImages((prevImages) => [...prevImages, ...validFiles]);
    } else {
      e.target.value = null;
    }
  };

  const removeImage = (fileName) => {
    setImages(images.filter((image) => image.name !== fileName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fieldId) {
      setMessage("Error: Field ID is missing.");
      setMessageType("error");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("field_id", fieldId);

    images.forEach((image) => {
      formData.append("img_url", image);
    });
    SetstartProcessLoad(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const response = await fetch(`${API_URL}/posts/post`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onPostSuccess(data.post);
        setMessage("โพสต์เรียบร้อย");
        setMessageType("success");
        setTitle("");
        setContent("");
        setImages([]);
        setShowPostForm(false);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      setMessage("ไม่สามารถเชือมต่อกับเซิร์ฟเวอร์ได้", error);
      setMessageType("error");
    } finally {
      SetstartProcessLoad(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      {message && (
        <div className={`message-box ${messageType}`}>
          <p>{message}</p>
        </div>
      )}
      <div className="post-container">
        {!showPostForm && (
          <button
            className="add-post-button"
            onClick={() => setShowPostForm(true)}
          >
            เพิ่มโพส
          </button>
        )}

        {showPostForm && (
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group-post">
              <label>หัวข้อ</label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                maxLength={255}
              />
            </div>

            <div className="form-group-post">
              <label>เนื้อหา</label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={255}
              ></textarea>
            </div>
            <div className="form-group-post">
              <label className="file-label-post">
                <input
                  multiple
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="file-input-hidden-post"
                />
                เลือกรูปภาพ
              </label>
            </div>

            <div className="image-preview-container-post">
              {images.length > 0 && (
                <div>
                  <h3>รูปภาพที่เลือก</h3>
                  <ul>
                    {images.map((image, index) => (
                      <li key={index}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={image.name}
                          style={{ width: 100, height: 100 }}
                        />
                        <button
                          type="button"
                          className="delpre"
                          onClick={() => removeImage(image.name)}
                        >
                          ลบ
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                cursor: startProcessLoad ? "not-allowed" : "pointer",
              }}
              disabled={startProcessLoad}
              className="submit-btn-post"
            >
              สร้างโพส
            </button>
            <button
              type="button"
              className="cancel-btn"
              style={{
                cursor: startProcessLoad ? "not-allowed" : "pointer",
              }}
              disabled={startProcessLoad}
              onClick={() => setShowPostForm(false)}
            >
              ยกเลิก
            </button>
            {startProcessLoad && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
          </form>
        )}
      </div>
    </>
  );
};

export default CreatePost;
