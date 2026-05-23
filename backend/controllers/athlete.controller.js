const Athlete = require('../models/athlete.model');
const User = require('../models/user.model');

exports.createProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const athleteData = { ...req.body, user_id: userId };

    const existingProfile = await Athlete.findByUserId(userId);
    if (existingProfile) {
      return res.status(400).json({ error: 'Perfil de atleta já existe' });
    }

    const athlete = await Athlete.create(athleteData);
    res.status(201).json({
      message: 'Perfil de atleta criado com sucesso',
      athlete
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const athlete = await Athlete.findByUserId(userId);

    if (!athlete) {
      return res.status(404).json({ error: 'Perfil de atleta não encontrado' });
    }

    res.json(athlete);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAthleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const athlete = await Athlete.findById(id);

    if (!athlete) {
      return res.status(404).json({ error: 'Atleta não encontrado' });
    }

    res.json(athlete);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const athlete = await Athlete.findByUserId(userId);

    if (!athlete) {
      return res.status(404).json({ error: 'Perfil de atleta não encontrado' });
    }

    const updatedAthlete = await Athlete.update(athlete.id, req.body);
    res.json({
      message: 'Perfil atualizado com sucesso',
      athlete: updatedAthlete
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchAthletes = async (req, res) => {
  try {
    const filters = req.query;
    const athletes = await Athlete.search(filters);
    res.json(athletes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllAthletes = async (req, res) => {
  try {
    const athletes = await Athlete.search({});
    res.json(athletes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
