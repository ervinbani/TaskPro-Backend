const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    }
  },
  {
    timestamps: true // Aggiunge automaticamente createdAt e updatedAt
  }
);

// Pre-save hook per hashare la password prima di salvare
userSchema.pre('save', async function (next) {
  // Esegui solo se la password è stata modificata (o è nuova)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Genera un salt (stringa random per rendere l'hash più sicuro)
    const salt = await bcrypt.genSalt(10);
    
    // Hash della password con il salt
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
  } catch (error) {
    next(error);
  }
});

// Metodo per comparare la password durante il login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
