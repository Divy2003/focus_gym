// controllers/memberController.js
const Member = require('../models/Member');
const { validationResult } = require('express-validator');
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Add new member
const addMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const memberData = req.body;
    const member = new Member(memberData);
    await member.save();

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      member
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member'
    });
  }
};

// Get all members with filters and search
const getMembers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const members = await Member.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Member.countDocuments(query);

    res.status(200).json({
      success: true,
      members,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: members.length,
        totalMembers: total
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch members'
    });
  }
};

// Update member
const updateMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const member = await Member.findByIdAndUpdate(id, updateData, { new: true });
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      member
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member'
    });
  }
};

// Delete member (soft delete)
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findByIdAndUpdate(
      id, 
      { isActive: false }, 
      { new: true }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete member'
    });
  }
};

// Bulk delete members
const bulkDeleteMembers = async (req, res) => {
  try {
    const { memberIds } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid member IDs'
      });
    }

    await Member.updateMany(
      { _id: { $in: memberIds } },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: `${memberIds.length} members deleted successfully`
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete members'
    });
  }
};

// Send message to members
const sendMessage = async (req, res) => {
  try {
    const { memberIds, message, includeLink } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid member IDs'
      });
    }

    const members = await Member.find({ 
      _id: { $in: memberIds }, 
      isActive: true 
    });

    const messagePromises = members.map(async (member) => {
      try {
        let messageText = message;
        if (includeLink) {
          messageText += `\n\nGym Portal: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`;
        }

        await client.messages.create({
          body: messageText,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: member.mobile
        });
        return { success: true, mobile: member.mobile };
      } catch (error) {
        return { success: false, mobile: member.mobile, error: error.message };
      }
    });

    const results = await Promise.all(messagePromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.status(200).json({
      success: true,
      message: `Messages sent: ${successful} successful, ${failed} failed`,
      results
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send messages'
    });
  }
};

module.exports = {
  addMember,
  getMembers,
  updateMember,
  deleteMember,
  bulkDeleteMembers,
  sendMessage
};