



router.get("/protected-route", authMiddleware, (req, res) => {
    res.json({ message: "This route is protected", user: req.user });
});
