import mongoose from 'mongoose';
const auditSchema = new mongoose.Schema(
  {
    targetCollection: { type: String, required: true }, // 'users'
    action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true },
    from: { type: Object, default: null },             // FROM (old state)
    to: { type: Object, default: null },              // TO (new state)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, versionKey: false }
);

const audit= mongoose.model('Audit', auditSchema);

export default audit;