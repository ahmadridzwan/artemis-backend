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

    // ✅ Prevent duplicate entries
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
    userBlocks.selectedType = newBlockType; // ✅ Ensure selectedType stays consistent
    
    await userBlocks.save();
    return res.status(200).json({ success: true, userBlocks });
  } catch (error) {
    console.error("Error selecting user blocks:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// const selectUserBlocks = async (req, res) => {
//   try {
//     const { blockIds } = req.body; // Array of selected block IDs

//     if (!blockIds || blockIds.length === 0) {
//       return res.status(400).json({ error: 'At least one block must be selected.' });
//     }

//     // Fetch the user's existing blocks
//     let userBlocks = await UserBlock.findOne({ userId: req.user.id });

//     // Fetch the selected predefined blocks
//     const selectedBlocks = await PredefinedBlock.find({ _id: { $in: blockIds } });

//     if (selectedBlocks.length !== blockIds.length) {
//       return res.status(400).json({ error: 'Invalid block selection.' });
//     }

//     const newSelectedType = selectedBlocks[0].type; // The type of the first selected block

//     // If the user already has selected blocks
//     if (userBlocks) {
//       // Prevent switching types unless all blocks are removed
//       if (userBlocks.selectedType && userBlocks.selectedType !== newSelectedType) {
//         return res.status(400).json({
//           error: `Cannot select ${newSelectedType} blocks while having existing ${userBlocks.selectedType} blocks. Remove all first.`,
//         });
//       }

//       // Ensure no duplicate blocks are added
//       const existingBlockIds = userBlocks.blocks.map(b => b.blockId.toString());
//       const newBlocks = selectedBlocks.filter(b => !existingBlockIds.includes(b._id.toString()));

//       if (newBlocks.length === 0) {
//         return res.status(400).json({ error: 'You have already selected these blocks.' });
//       }

//       // Append new blocks while keeping existing ones
//       userBlocks.blocks = [...userBlocks.blocks, ...newBlocks.map(block => ({
//         blockId: block._id,
//         name: block.name,
//         description: block.description,
//       }))];

//       userBlocks.selectedType = newSelectedType; // Ensure type is correctly set
//     } else {
//       // First-time selection: Create a new user blocks entry
//       userBlocks = new UserBlock({
//         userId: req.user.id,
//         blocks: selectedBlocks.map(block => ({
//           blockId: block._id,
//           name: block.name,
//           description: block.description,
//         })),
//         selectedType: newSelectedType,
//       });
//     }

//     await userBlocks.save();

//     res.status(201).json({ message: 'User blocks updated successfully', userBlocks });
//   } catch (err) {
//     console.error('Error selecting user blocks:', err);
//     res.status(500).json({ error: 'Failed to select user blocks' });
//   }
// };

const removeUserBlock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blockId } = req.body;

    const updatedUserBlocks = await UserBlock.findOneAndUpdate(
      { userId },
      { $pull: { blocks: { _id: blockId } } },
      { new: true }
    );

    if (!updatedUserBlocks) {
      return res.status(404).json({ error: "User blocks not found." });
    }

    if (updatedUserBlocks.blocks.length === 0) {
      updatedUserBlocks.selectedType = null;
      await updatedUserBlocks.save();
    }

    res.status(200).json({ success: true, blocks: updatedUserBlocks.blocks });
  } catch (error) {
    console.error("Error removing block:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// /**
//  * Remove a block from the user's selection
//  */
// const removeUserBlock = async (req, res) => {
//   try {
//     const { blockId } = req.body;

//     if (!blockId) {
//       return res.status(400).json({ error: 'Block ID is required.' });
//     }

//     const userBlocks = await UserBlock.findOne({ userId: req.user.id });

//     if (!userBlocks) {
//       return res.status(404).json({ error: 'No blocks found for the user.' });
//     }

//     // Remove the block from the selection
//     userBlocks.blocks = userBlocks.blocks.filter(block => block.blockId.toString() !== blockId);

//     // If all blocks are removed, reset `selectedType`
//     if (userBlocks.blocks.length === 0) {
//       userBlocks.selectedType = null;
//     }

//     await userBlocks.save();

//     res.status(200).json({ message: 'Block removed successfully', userBlocks });
//   } catch (err) {
//     console.error('Error removing user block:', err);
//     res.status(500).json({ error: 'Failed to remove user block' });
//   }
// };


module.exports = { getUserBlocks, selectUserBlocks, removeUserBlock };
