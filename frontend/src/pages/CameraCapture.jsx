import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCw, Check, Upload } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose, currentImage }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(currentImage || null);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Stop existing stream if any
      stopCamera();

      // Request camera access with constraints
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setIsLoading(false);
          }).catch(err => {
            console.error('Error playing video:', err);
            setError('Failed to start video stream');
            setIsLoading(false);
          });
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      let errorMessage = 'Could not access camera. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please grant camera permission.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob and create data URL
    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.9);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
      onClose();
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'white'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem' }}>
          {capturedImage ? 'Review Photo' : 'Take Photo'}
        </h3>
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {error && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            maxWidth: '80%',
            textAlign: 'center',
            zIndex: 10
          }}>
            <p style={{ margin: '0 0 1rem 0' }}>{error}</p>
            <button
              onClick={startCamera}
              style={{
                backgroundColor: 'white',
                color: '#ef4444',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {isLoading && !error && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textAlign: 'center',
            zIndex: 10
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p>Starting camera...</p>
          </div>
        )}

        {/* Video Element */}
        {!capturedImage && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: isLoading || error ? 'none' : 'block'
            }}
          />
        )}

        {/* Captured Image Preview */}
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        )}

        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Controls */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {!capturedImage ? (
          <>
            {/* Upload from Gallery */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'white'
            }}>
              <Upload size={24} />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>

            {/* Capture Button */}
            <button
              onClick={capturePhoto}
              disabled={isLoading || !!error}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                border: '4px solid white',
                backgroundColor: 'transparent',
                cursor: isLoading || error ? 'not-allowed' : 'pointer',
                position: 'relative',
                opacity: isLoading || error ? 0.5 : 1
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }} />
            </button>

            {/* Switch Camera */}
            <button
              onClick={switchCamera}
              disabled={isLoading || !!error}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                cursor: isLoading || error ? 'not-allowed' : 'pointer',
                color: 'white',
                opacity: isLoading || error ? 0.5 : 1
              }}
            >
              <RotateCw size={24} />
            </button>
          </>
        ) : (
          <>
            {/* Retake Button */}
            <button
              onClick={retakePhoto}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              <RotateCw size={20} />
              Retake
            </button>

            {/* Confirm Button */}
            <button
              onClick={confirmPhoto}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              <Check size={20} />
              Confirm
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CameraCapture;