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

const selectUserBlocks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blockIds } = req.body;

    if (!blockIds || blockIds.length === 0) {
      return res.status(400).json({ error: "At least one block must be selected." });
    }

    const selectedBlocks = await PredefinedBlock.find({ _id: { $in: blockIds } });

    if (selectedBlocks.length !== blockIds.length) {
      return res.status(400).json({ error: "Invalid block selection." });
    }

    const newBlockType = selectedBlocks[0].type;

    let userBlocks = await UserBlock.findOne({ userId });

    if (!userBlocks) {
      userBlocks = new UserBlock({
        userId,
        blocks: selectedBlocks.map(block => ({
          blockId: block._id,
          name: block.name,
          description: block.description,
          type: block.type,
          icon: block.icon,
        })),
        selectedType: newBlockType,
      });

      await userBlocks.save();
      return res.status(200).json({ success: true, userBlocks });
    }

    if (userBlocks.selectedType && userBlocks.blocks.length > 0 && userBlocks.selectedType !== newBlockType) {
      return res.status(400).json({ error: "Cannot mix single and grouped blocks. Remove existing blocks first." });
    }

    // Prevent duplicate entries
    const existingBlockIds = new Set(userBlocks.blocks.map(block => block.blockId.toString()));
    const newBlocks = selectedBlocks
      .filter(block => !existingBlockIds.has(block._id.toString()))
      .map(block => ({
        blockId: block._id,
        name: block.name,
        description: block.description,
        type: block.type,
        icon: block.icon,
      }));

    if (newBlocks.length === 0) {
      return res.status(400).json({ error: "You already have these blocks selected." });
    }

    userBlocks.blocks.push(...newBlocks);
    userBlocks.selectedType = newBlockType; //Ensure selectedType stays consistent
    
    await userBlocks.save();
    return res.status(200).json({ success: true, userBlocks });
  } catch (error) {
    console.error("Error selecting user blocks:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getUserBlocks, selectUserBlocks, removeUserBlock };
