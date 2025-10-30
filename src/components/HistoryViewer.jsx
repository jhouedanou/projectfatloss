import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Tabs, 
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import SyncIcon from '@mui/icons-material/Sync';
import LockIcon from '@mui/icons-material/Lock';
import { 
  downloadDataAsJSON, 
  importDataFromJSON, 
  exportLocalData 
} from '../services/DataSyncService';
import { getWorkoutHistory, getWorkoutStats } from '../services/WorkoutStorage';
import { getWeightHistory } from '../services/WeightStorage';
import { verifyPassword } from '../config/auth';

export default function HistoryViewer({ onClose }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [workouts, setWorkouts] = useState([]);
  const [weights, setWeights] = useState([]);
  const [stats, setStats] = useState({});
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  const loadData = () => {
    setWorkouts(getWorkoutHistory());
    setWeights(getWeightHistory());
    setStats(getWorkoutStats());
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (verifyPassword(password)) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Mot de passe incorrect');
      setPassword('');
    }
  };

  const handleDownload = () => {
    downloadDataAsJSON();
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const success = await importDataFromJSON(file);
      if (success) {
        loadData();
        setImportDialogOpen(false);
        alert('Données importées avec succès');
      } else {
        alert('Erreur lors de l\'importation des données');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!authenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: 3
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            maxWidth: 400,
            width: '100%',
            textAlign: 'center'
          }}
        >
          <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Historique protégé
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Veuillez entrer le mot de passe pour accéder à l'historique
          </Typography>
          <form onSubmit={handlePasswordSubmit}>
            <TextField
              type="password"
              fullWidth
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              helperText={error}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
              >
                Déverrouiller
              </Button>
              {onClose && (
                <Button
                  variant="outlined"
                  onClick={onClose}
                >
                  Annuler
                </Button>
              )}
            </Box>
          </form>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Historique complet</Typography>
        <Box>
          <IconButton onClick={handleDownload} title="Exporter les données">
            <DownloadIcon />
          </IconButton>
          <IconButton onClick={() => setImportDialogOpen(true)} title="Importer les données">
            <UploadIcon />
          </IconButton>
          <IconButton onClick={loadData} title="Rafraîchir">
            <SyncIcon />
          </IconButton>
          {onClose && (
            <Button onClick={onClose} variant="outlined" size="small" sx={{ ml: 1 }}>
              Fermer
            </Button>
          )}
        </Box>
      </Box>

      {/* Statistiques globales */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Statistiques globales</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Total séances</Typography>
            <Typography variant="h6">{stats.totalWorkouts || 0}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Calories brûlées</Typography>
            <Typography variant="h6">{stats.totalCalories || 0} kcal</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Durée totale</Typography>
            <Typography variant="h6">{Math.round((stats.totalDuration || 0) / 60)} min</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Poids total soulevé</Typography>
            <Typography variant="h6">{stats.totalWeightLifted || 0} kg</Typography>
          </Box>
        </Box>
      </Paper>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label={`Séances (${workouts.length})`} />
        <Tab label={`Pesées (${weights.length})`} />
      </Tabs>

      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Titre</TableCell>
                <TableCell align="right">Calories</TableCell>
                <TableCell align="right">Durée (min)</TableCell>
                <TableCell align="right">Poids soulevé (kg)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Aucune séance enregistrée
                  </TableCell>
                </TableRow>
              ) : (
                workouts.map((workout) => (
                  <TableRow key={workout.id}>
                    <TableCell>{formatDate(workout.date)}</TableCell>
                    <TableCell>{workout.title}</TableCell>
                    <TableCell align="right">{workout.calories || 0}</TableCell>
                    <TableCell align="right">{Math.round((workout.duration || 0) / 60)}</TableCell>
                    <TableCell align="right">{workout.weightLifted || 0}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Poids (kg)</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weights.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Aucune pesée enregistrée
                  </TableCell>
                </TableRow>
              ) : (
                weights.map((weight) => (
                  <TableRow key={weight.id}>
                    <TableCell>{formatDate(weight.date)}</TableCell>
                    <TableCell align="right">{weight.weight}</TableCell>
                    <TableCell>{weight.notes || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog d'import */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Importer des données</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Sélectionnez un fichier JSON exporté précédemment pour importer vos données.
          </Typography>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'block', marginTop: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
