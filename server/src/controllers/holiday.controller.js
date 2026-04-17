import Holiday from "../models/Holiday.js";

/**
 * CREATE HOLIDAY (ADMIN)
 */
export const createHoliday = async (req, res) => {
  try {
    const { title, date, type, description } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required" });
    }

    const exists = await Holiday.findOne({
      institutionId: req.user.institutionId,
      date: new Date(date)
    });

    if (exists) {
      return res.status(400).json({ message: "A holiday already exists on this date" });
    }

    const holiday = await Holiday.create({
      institutionId: req.user.institutionId,
      title,
      date,
      type: type || "HOLIDAY",
      description: description || ""
    });

    res.status(201).json({ message: "Holiday created successfully", holiday });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET HOLIDAYS (ALL ROLES)
 */
export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find({
      institutionId: req.user.institutionId
    }).sort({ date: 1 });

    res.json({ holidays });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE HOLIDAY (ADMIN)
 */
export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, type, description } = req.body;

    const holiday = await Holiday.findOne({
      _id: id,
      institutionId: req.user.institutionId
    });

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    // If date is changing, check for conflicts
    if (date && new Date(date).toDateString() !== new Date(holiday.date).toDateString()) {
      const conflict = await Holiday.findOne({
        institutionId: req.user.institutionId,
        date: new Date(date),
        _id: { $ne: id }
      });
      if (conflict) {
        return res.status(400).json({ message: "Another holiday already exists on this date" });
      }
    }

    const updated = await Holiday.findByIdAndUpdate(
      id,
      { title, date, type, description },
      { new: true, runValidators: true }
    );

    res.json({ message: "Holiday updated successfully", holiday: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE HOLIDAY (ADMIN)
 */
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findOne({
      _id: id,
      institutionId: req.user.institutionId
    });

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    await Holiday.findByIdAndDelete(id);
    res.json({ message: "Holiday deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
