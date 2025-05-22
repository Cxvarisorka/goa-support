const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.loginToken;

    if (!token) {
        return res.status(401).json({ message: 'დაგვავიწყდა ავტორიზაცია!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // ვამატებთ დეშიფრირებულ ინფორმაციას (id, role...) req.user-ში
        next(); // გადადით შემდეგ middlewares ან controllers-ში
    } catch (err) {
        return res.status(403).json({ message: 'ტოკენი არასწორია ან ვადა გაუვიდა!' });
    }
};

module.exports = verifyToken;
