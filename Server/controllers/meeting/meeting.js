const meetingHistory = require('../../model/schema/meeting')
const { Contact } = require('../../model/schema/contact')
const { Lead } = require('../../model/schema/lead')
const User = require('../../model/schema/user')
const mongoose = require('mongoose');

const index = async (req, res) => {
  try {
      let query = { deleted: false };
      
      if (req.query.agenda) {
          query.agenda = { $regex: req.query.agenda, $options: 'i' };
      }
      
      if (req.query.createBy) {

          const matchingUsers = await User.find({
              username: { $regex: req.query.createBy, $options: 'i' }
          }).select('_id');
          
          if (matchingUsers.length > 0) {
              query.createBy = { $in: matchingUsers.map(user => user._id) };
          } else {

              query.createBy = { $in: [] };
          }
      }
      
      
      if (req.query.startDate || req.query.endDate) {
          query.dateTime = {};
          if (req.query.startDate) {
              query.dateTime.$gte = new Date(req.query.startDate);
          }
          if (req.query.endDate) {
              
              const endDate = new Date(req.query.endDate);
              endDate.setHours(23, 59, 59, 999);
              query.dateTime.$lte = endDate;
          }
      }
      
     
      if (req.query.timeStartDate || req.query.timeEndDate) {
          query.timestamp = {};
          if (req.query.timeStartDate) {
              query.timestamp.$gte = new Date(req.query.timeStartDate);
          }
          if (req.query.timeEndDate) {
            
              const endDate = new Date(req.query.timeEndDate);
              endDate.setHours(23, 59, 59, 999);
              query.timestamp.$lte = endDate;
          }
      }

      const data = await meetingHistory.find(query)
        .populate("attendes")
        .populate("attendesLead")
        .populate("createBy", "username");
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}

const add = async (req, res) => {
    try {
        const result = new meetingHistory(req.body);
        await result.save();
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to create :', err);
        res.status(400).json({ err, error: 'Failed to create' });
    }
}


const view = async (req, res) => {
    try {
        const meeting = await meetingHistory.findOne({ _id: req.params.id, deleted: false })
          .populate('attendes', 'fullName email')
          .populate('attendesLead', 'leadName email')     
          .populate('createBy', 'username email');           
    
        if (!meeting) {
          return res.status(404).json({ error: 'Meeting not found' });
        }
    
        res.status(200).json({ success: true, data: meeting });
      } catch (err) {
        res.status(500).json({ error: 'Server error' });
      }
}

const edit = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const meeting = await meetingHistory.findOne({ _id: id, deleted: false });
        
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        const result = await meetingHistory.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).populate('attendes', 'fullName email')
         .populate('attendesLead', 'leadName email')
         .populate('createBy', 'username email');
        
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error('Failed to update meeting:', err);
        res.status(500).json({ error: 'Failed to update meeting' });
    }
}

const deleteData = async (req, res) => {
  try {
    const id = req.params.id; 
    const result = await meetingHistory.updateOne(
      { _id: id },
      { $set: { deleted: true } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.status(200).json({ message: "Record deleted successfully", result });
  } catch (err) {
    res.status(500).json({ message: "Error deleting record", err });
  }
};

const deleteMany = async (req, res) => {
  try {
      const result = await meetingHistory.updateMany({ _id: { $in: req.body } }, { $set: { deleted: true } });
      res.status(200).json({ message: "done", result })
  } catch (err) {
      res.status(404).json({ message: "error", err })
  }
}

module.exports = { add, index, view, deleteData, deleteMany, edit }