const bcrypt = require("bcrypt");

const hashPassword = async (password, saltLevel = 10) => {
    const salt = await bcrypt.genSalt(saltLevel);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

module.exports = hashPassword;