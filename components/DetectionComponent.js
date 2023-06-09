import { useState, useRef, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

const DetectionComponent = () => {
	const [imageUrl, setImageUrl] = useState('');
	const [message, setMessage] = useState('');
	const [contactLinks, setContactLinks] = useState([]);
	const videoRef = useRef(null);

	useEffect(() => {
		const loadModel = async () => {
			const model = await cocoSsd.load();

			const video = videoRef.current;
			const canvas = document.createElement('canvas');

			const runObjectDetection = () => {
				const context = canvas.getContext('2d');
				context.drawImage(video, 0, 0, video.width, video.height);

				model.detect(video).then((predictions) => {
					// Procesa las predicciones y muestra el mensaje correspondiente
					// utilizando setMessage()
					setMessage(`Número de objetos detectados: ${predictions.length}`);
				});

				requestAnimationFrame(runObjectDetection);
			};

			video.addEventListener('loadedmetadata', () => {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				runObjectDetection();
			});
		};

		loadModel();
	}, []);

	const handleFormSubmit = (e) => {
		e.preventDefault();
		// Lógica para procesar el formulario
		// y mostrar la cámara para la detección de objetos
		startObjectDetection();
	};

	const startObjectDetection = () => {
		const video = videoRef.current;

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices
				.getUserMedia({ video: true })
				.then((stream) => {
					video.srcObject = stream;
					video.play();
				})
				.catch((error) => {
					console.error('Error al acceder a la cámara:', error);
				});
		}
	};

	return (
		<div>
			<form onSubmit={handleFormSubmit}>
				{/* Formulario y otros elementos */}
				<button type="submit">Iniciar detección</button>
			</form>

			<video ref={videoRef} width="640" height="480" autoPlay muted></video>

			<p>Mensaje: {message}</p>
		</div>
	);
};

export default DetectionComponent;
