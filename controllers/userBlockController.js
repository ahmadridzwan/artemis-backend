const UserBlock = require('../models/UserBlock');
const PredefinedBlock = require('../models/PredefinedBlock');
/**
 * Get the user's selected blocks
 */
const getUserBlocks = async (req, res) => {
  try {
    const userBlocks = await UserBlock.findOne({ userId: req.user.id }).populate('blocks.blockId');

    if (!userBlocks) {
      return res.status(200).json({ blocks: [], selectedType: null }); // Return empty blocks for new users
    }

    res.status(200).json({ blocks: userBlocks.blocks, selectedType: userBlocks.selectedType });
  } catch (err) {
    console.error('Error fetching user blocks:', err);
    res.status(500).json({ error: 'Failed to fetch user blocks' });
  }
};

/**
 * Select (or add) blocks for the user without overwriting existing grouped blocks.
 */
const selectUserBlocks = async (req, res) => {
  try {
    const { blockIds } = req.body; // Array of selected block IDs

    if (!blockIds || blockIds.length === 0) {
      return res.status(400).json({ error: 'At least one block must be selected.' });
    }

    // Fetch the user's existing blocks
    let userBlocks = await UserBlock.findOne({ userId: req.user.id });

    // Fetch the selected predefined blocks
    const selectedBlocks = await PredefinedBlock.find({ _id: { $in: blockIds } });

    if (selectedBlocks.length !== blockIds.length) {
      return res.status(400).json({ error: 'Invalid block selection.' });
    }

    const newSelectedType = selectedBlocks[0].type; // The type of the first selected block

    // If the user already has selected blocks
    if (userBlocks) {
      // Prevent switching types unless all blocks are removed
      if (userBlocks.selectedType && userBlocks.selectedType !== newSelectedType) {
        return res.status(400).json({
          error: `Cannot select ${newSelectedType} blocks while having existing ${userBlocks.selectedType} blocks. Remove all first.`,
        });
      }

      // Ensure no duplicate blocks are added
      const existingBlockIds = userBlocks.blocks.map(b => b.blockId.toString());
      const newBlocks = selectedBlocks.filter(b => !existingBlockIds.includes(b._id.toString()));

      if (newBlocks.length === 0) {
        return res.status(400).json({ error: 'You have already selected these blocks.' });
      }

      // Append new blocks while keeping existing ones
      userBlocks.blocks = [...userBlocks.blocks, ...newBlocks.map(block => ({
        blockId: block._id,
        name: block.name,
        description: block.description,
      }))];

      userBlocks.selectedType = newSelectedType; // Ensure type is correctly set
    } else {
      // First-time selection: Create a new user blocks entry
      userBlocks = new UserBlock({
        userId: req.user.id,
        blocks: selectedBlocks.map(block => ({
          blockId: block._id,
          name: block.name,
          description: block.description,
        })),
        selectedType: newSelectedType,
      });
    }

    await userBlocks.save();

    res.status(201).json({ message: 'User blocks updated successfully', userBlocks });
  } catch (err) {
    console.error('Error selecting user blocks:', err);
    res.status(500).json({ error: 'Failed to select user blocks' });
  }
};


/**
 * Remove a block from the user's selection
 */
const removeUserBlock = async (req, res) => {
  try {
    const { blockId } = req.body;

    if (!blockId) {
      return res.status(400).json({ error: 'Block ID is required.' });
    }

    const userBlocks = await UserBlock.findOne({ userId: req.user.id });

    if (!userBlocks) {
      return res.status(404).json({ error: 'No blocks found for the user.' });
    }

    // Remove the block from the selection
    userBlocks.blocks = userBlocks.blocks.filter(block => block.blockId.toString() !== blockId);

    // If all blocks are removed, reset `selectedType`
    if (userBlocks.blocks.length === 0) {
      userBlocks.selectedType = null;
    }

    await userBlocks.save();

    res.status(200).json({ message: 'Block removed successfully', userBlocks });
  } catch (err) {
    console.error('Error removing user block:', err);
    res.status(500).json({ error: 'Failed to remove user block' });
  }
};


module.exports = { getUserBlocks, selectUserBlocks, removeUserBlock };
