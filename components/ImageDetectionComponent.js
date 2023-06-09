import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const ImageDetectionComponent = () => {
	const videoRef = useRef(null);
	const [model, setModel] = useState(null);
	const [uploadedImage, setUploadedImage] = useState(null);
	const [uploadedVideo, setUploadedVideo] = useState(null);
	const [predictionsImg, setPredictionsImg] = useState();
	const [predictions, setPredictions] = useState([]);
	const [showOverlay, setShowOverlay] = useState(false);
	const [formData, setFormData] = useState({
		instagram: '',
		facebook: '',
		location: '',
		contact: '',
		whatsapp: ''
	});

	useEffect(() => {
		const loadModel = async () => {
			await tf.setBackend('webgl');
			await tf.ready();
			const loadedModel = await cocoSsd.load();
			setModel(loadedModel);
		};

		loadModel();
	}, []);

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		const reader = new FileReader();

		reader.onload = async (event) => {
			const image = new Image();
			image.onload = async () => {
				setUploadedImage(image);

				const predictionsImg1 = await model.detect(image);

				console.log('Image Detection Results:');
				predictionsImg1.forEach((prediction) => {
					console.log(prediction);
					setPredictionsImg(prediction);
				});
			};
			image.src = event.target.result;
		};

		reader.readAsDataURL(file);
	};

	const handleVideoUpload = (e) => {
		const file = e.target.files[0];
		const reader = new FileReader();

		reader.onload = (event) => {
			setUploadedVideo(event.target.result);
		};

		reader.readAsDataURL(file);
	};

	const handleFormChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleFormSubmit = (e) => {
		e.preventDefault();
		// Aquí puedes realizar acciones con los datos del formulario
		console.log(formData);
	};

	useEffect(() => {
		if (!model) return;

		const video = videoRef.current;
		let requestId;
		let timerId;

		const detectObjects = async () => {
			if (video.readyState === video.HAVE_ENOUGH_DATA) {
				const predictions = await model.detect(video);
				setPredictions(predictions);

				predictions.forEach((prediction) => {
					let predictionUp = predictionsImg?.bbox[0] + 15;
					let predictionDown = predictionsImg?.bbox[0] - 15;
					console.log(prediction?.bbox[0]);
					console.log(predictionsImg?.class, prediction?.class);

					if (
						prediction?.class === predictionsImg?.class ||
						(prediction.bbox[0] > predictionDown &&
							prediction.bbox[0] < predictionUp)
					) {
						console.log('son similares las imagenes');
						setShowOverlay(true);

						clearTimeout(timerId);
						timerId = setTimeout(() => {
							setShowOverlay(false);
						}, 15000);
					}
				});
			}

			requestId = requestAnimationFrame(detectObjects);
		};

		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				video.srcObject = stream;
				video.play();
				requestId = requestAnimationFrame(detectObjects);
			})
			.catch((error) => {
				console.error('Error accessing camera:', error);
			});

		return () => {
			if (requestId) {
				cancelAnimationFrame(requestId);
			}
			if (timerId) {
				clearTimeout(timerId);
			}
		};
	}, [model, predictionsImg]);

	return (
		<div style={{ position: 'relative' }}>
			<h2>Image Detection</h2>

			<h3>Upload Image</h3>
			<input type="file" accept="image/*" onChange={handleImageUpload} />

			{uploadedImage && (
				<div>
					<h3>Uploaded Image</h3>
					<img
						src={uploadedImage.src}
						alt="Uploaded"
						width="640"
						height="480"
					/>
				</div>
			)}

			<h3>Upload Video</h3>
			<input type="file" accept="video/*" onChange={handleVideoUpload} />

			{showOverlay && uploadedVideo && (
				<div style={{ position: 'relative' }}>
					<h3>Overlay Video</h3>
					<video
						className="absolute w-[35%] left-[32.5%]"
						src={uploadedVideo}
						width="640"
						height="480"
						autoPlay
					></video>

					<div
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							margin: '20px'
						}}
					>
						<button
							style={{ marginBottom: '10px' }}
							onClick={() => window.open(formData.instagram)}
						>
							Instagram
						</button>
						<button
							style={{ marginBottom: '10px' }}
							onClick={() => window.open(formData.facebook)}
						>
							Facebook
						</button>
						<button
							style={{ marginBottom: '10px' }}
							onClick={() => window.open(formData.location)}
						>
							Ubicación
						</button>
						<button
							style={{ marginBottom: '10px' }}
							onClick={() => window.open(formData.contact)}
						>
							Contacto
						</button>
						<button
							style={{ marginBottom: '10px' }}
							onClick={() => window.open(formData.whatsapp)}
						>
							WhatsApp
						</button>
					</div>
				</div>
			)}

			{predictions.length > 0 && (
				<div>
					<h3>Object Detection Results</h3>
					{predictions.map((prediction, index) => (
						<div key={index}>
							<p>Class: {prediction.class}</p>
							<p>Score: {prediction.score}</p>
							<hr />
						</div>
					))}
				</div>
			)}

			<h3>Live Video Detection</h3>
			<video ref={videoRef} width="100%" height="auto" autoPlay muted></video>

			<h3>Contact Form</h3>
			<form onSubmit={handleFormSubmit}>
				<label>
					Instagram:
					<input type="text" name="instagram" onChange={handleFormChange} />
				</label>
				<br />
				<label>
					Facebook:
					<input type="text" name="facebook" onChange={handleFormChange} />
				</label>
				<br />
				<label>
					Location:
					<input type="text" name="location" onChange={handleFormChange} />
				</label>
				<br />
				<label>
					Contact:
					<input type="text" name="contact" onChange={handleFormChange} />
				</label>
				<br />
				<label>
					WhatsApp:
					<input type="text" name="whatsapp" onChange={handleFormChange} />
				</label>
				<br />
				<button type="submit">Submit</button>
			</form>
		</div>
	);
};

export default ImageDetectionComponent;
