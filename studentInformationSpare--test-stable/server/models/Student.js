import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  idNumber: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  middleName: {
    type: String
  },
  lastName: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Student = mongoose.model("students-data", studentSchema);

export default Student;