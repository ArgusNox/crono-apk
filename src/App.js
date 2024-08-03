import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CustomModal from './components/CustomModal';
import ConfirmModal from './components/ConfirmModal'; // Importa el modal de confirmación

const App = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [activity, setActivity] = useState('');
  const [color, setColor] = useState('red');
  const [segments, setSegments] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [editActivity, setEditActivity] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Estado para controlar el modal de confirmación
  const [confirmAction, setConfirmAction] = useState(null); // Acción a confirmar
  const [confirmMessage, setConfirmMessage] = useState(''); // Mensaje de confirmación

  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 1000);
      }, 1000);
    } else if (!running) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    displaySavedSegments();
  }, []);

  const handleStart = () => {
    if (activity.trim() === '') {
      showAlert("Debes escribir el nombre de la actividad antes de iniciar el cronómetro.", 'danger');
      return;
    }
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

  const handleReset = () => {
    showResetConfirmation();
  };

  const showResetConfirmation = () => {
    setConfirmMessage("¿Estás seguro de que quieres reiniciar el cronómetro?");
    setConfirmAction(() => resetTimer);
    setShowConfirmModal(true);
  };

  const resetTimer = () => {
    setTime(0);
    setRunning(false);
    setShowConfirmModal(false);
  };

  const handleSave = () => {
    if (activity.trim() === '') {
      showAlert("No puedes guardar sin escribir la actividad.", 'info');
      return;
    }
    if (time <= 0) {
      showAlert("No puedes guardar sin iniciar el cronómetro.", 'info');
      return;
    }

    const newSegment = {
      activity,
      color,
      time,
    };

    saveSegment(newSegment);
    setTime(0);
    setActivity('');
    setRunning(false); // Detener el cronómetro después de guardar
    showAlert("Segmento guardado exitosamente.", 'success');
  };

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 7000);
  };

  const handleDelete = (date, index) => {
    setConfirmMessage("¿Estás seguro de que deseas eliminar esta actividad?");
    setConfirmAction(() => () => deleteSegment(date, index));
    setShowConfirmModal(true);
  };

  const deleteSegment = (date, index) => {
    const savedSegments = JSON.parse(localStorage.getItem('segments')) || {};
    if (savedSegments[date]) {
      savedSegments[date].splice(index, 1);
      if (savedSegments[date].length === 0) {
        delete savedSegments[date];
      }
      localStorage.setItem('segments', JSON.stringify(savedSegments));
      displaySavedSegments();
      showAlert("Segmento eliminado exitosamente.", 'danger');
    }
    setShowConfirmModal(false);
  };

  const handleEdit = (date, index) => {
    setEditIndex({ date, index });
    const savedSegments = JSON.parse(localStorage.getItem('segments')) || {};
    if (savedSegments[date] && savedSegments[date][index]) {
      setEditActivity(savedSegments[date][index].activity);
      setShowModal(true); // Mostrar el modal personalizado
    }
  };

  const confirmEdit = () => {
    const { date, index } = editIndex;
    const savedSegments = JSON.parse(localStorage.getItem('segments')) || {};
    if (savedSegments[date] && savedSegments[date][index]) {
      const originalSegment = savedSegments[date][index];
      const newActivityName = editActivity.trim();
      const duplicateIndex = savedSegments[date].findIndex(seg => seg.activity === newActivityName && seg.color === originalSegment.color);

      if (duplicateIndex !== -1 && duplicateIndex !== index) {
        // Fusionar actividades
        savedSegments[date][duplicateIndex].time += originalSegment.time;
        savedSegments[date].splice(index, 1);
      } else {
        // Actualizar el nombre de la actividad
        originalSegment.activity = newActivityName;
      }

      localStorage.setItem('segments', JSON.stringify(savedSegments));
      displaySavedSegments();
      setShowModal(false); // Cerrar el modal personalizado
      showAlert("Actividad editada exitosamente.", 'info');
    }
  };

  const saveSegment = (segment) => {
    const savedSegments = JSON.parse(localStorage.getItem('segments')) || {};
    const today = new Date().toLocaleDateString();

    if (!savedSegments[today]) {
      savedSegments[today] = [];
    }

    const existingSegmentIndex = savedSegments[today].findIndex(
      (seg) => seg.activity === segment.activity && seg.color === segment.color
    );

    if (existingSegmentIndex !== -1) {
      savedSegments[today][existingSegmentIndex].time += segment.time;
    } else {
      savedSegments[today].push(segment);
    }

    localStorage.setItem('segments', JSON.stringify(savedSegments));
    displaySavedSegments();
  };

  const displaySavedSegments = () => {
    const savedSegments = JSON.parse(localStorage.getItem('segments')) || {};
    setSegments(savedSegments);
  };

  return (
    <div className="container mt-5">
      {alert.show && <div className={`alert alert-${alert.type} fade show`} role="alert">{alert.message}</div>}
      <h1 className="text-center">Project Crono - Agustin Brizuela</h1>
      <div className="controls form-inline justify-content-center my-4">
        <input
          type="text"
          id="activity"
          className="form-control mr-2"
          placeholder="Actividad"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
        />
        <div className="select-arrow">
          <select
            id="colorPicker"
            className="form-control mr-2"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            <option value="red">Rojo</option>
            <option value="green">Verde</option>
            <option value="blue">Azul</option>
            <option value="yellow">Amarillo</option>
            <option value="orange">Naranja</option>
          </select>
        </div>
        <div id="menu-botones-track">
          <button onClick={handleStart} className="btn btn-primary mr-2 menuBotones">Iniciar</button>
          <button onClick={handleStop} className="btn btn-secondary mr-2 menuBotones">Detener</button>
          <button onClick={handleReset} className="btn btn-warning mr-2 menuBotones">Reiniciar</button>
          <button onClick={handleSave} className="btn btn-success menuBotones">Guardar</button>
        </div>
      </div>
      <div id="timer" className="text-center display-4 timer-animation">{formatTime(time)}</div>
      <h2 className="text-center mt-4 segmentosTitulo">Segmentos Guardados</h2>
      <div id="saved-segments-container" className="mt-3">
        {Object.keys(segments).map((date) => (
          <div key={date} className='fecha-actividad'>
            <h3 className='fecha-actividad-texto'>{date}</h3>
            {segments[date].map((segment, index) => (
              <div key={index} className={`segment ${segment.color}`}>
                {formatTime(segment.time)} - {segment.activity}
                <div id="botones-slots">
                  <button className="btn btn-light ml-2 edit-button" onClick={() => handleEdit(date, index)}>Editar</button>
                  <button className="btn btn-danger ml-2 delete-button" onClick={() => handleDelete(date, index)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <CustomModal show={showModal} handleClose={() => setShowModal(false)} title="Editar Actividad">
        <input
          type="text"
          className="form-control"
          id="editActivityInput"
          value={editActivity}
          onChange={(e) => setEditActivity(e.target.value)}
        />
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={confirmEdit}>Guardar Cambios</button>
        </div>
      </CustomModal>

      <ConfirmModal
        show={showConfirmModal}
        handleClose={() => setShowConfirmModal(false)}
        handleConfirm={confirmAction}
        title="Confirmar Acción"
        message={confirmMessage}
      />
    </div>
  );
};

export default App;
