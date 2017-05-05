var UserSQL = {  
                insert:'INSERT INTO User(username,password) VALUES(?,?)',
                queryAll:'SELECT * FROM User',  
                getUserById:'SELECT * FROM User WHERE id = ? ',
                getUserByName:'SELECT * FROM User where username = ?',
                getUserByNameAndPassword:'SELECT * FROM User where username = ? and password = ?',
                deleteById:'DELETE FROM User where id = ?',
                updateById:'UPDATE User SET username = ?,password = ? where id = ?',
              };
 module.exports = UserSQL;