const middleware = {
    isAuthenticated: (req, res, next) => {
        if (!req.session.user) {
            res.redirect('/users/login')
            return
        }  
        next();
    },
    authUser: (req, res, next) => {
        res.locals.authUser = null;
        if (req.session.user) {
            res.locals.authUser = req.session.user;
        }  
        next();
    },
    shareData: (req, res, next) => {
        
    }
}
module.exports = middleware;