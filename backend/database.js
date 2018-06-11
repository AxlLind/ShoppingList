let _      = require('lodash');
let config = require('./config.js');
let knex   = require('knex')({
    client: config.dbClient,
    connection: config.dbConn,
});

class Database {
    checkEmail(email) {
        return knex('users')
            .select('*')
            .where({ email })
            .then(rows => !_.isEmpty(rows));
    }

    createUser(email, pw_hash) {
        const date_created = new Date();
        return knex('users')
            .insert({ email, pw_hash, date_created });
    }

    createList(list_name, email) {
        return knex('users')
            .select('user_id')
            .where({ email })
            .then(rows => rows[0].user_id)
            .then(user_id => knex('lists')
                .insert({
                    list_name,
                    user_id,
                    date_created: new Date(),
                })
            );
    }

    getUser(email) {
        return knex('users')
            .select('*')
            .where({ email })
            .then(rows => _.isEmpty(rows) ? {} : rows[0]);
    }

    addItemToList(list_id, item) {
        return knex('listitems')
            .insert({
                list_id,
                item,
            });
    }

    getUsersLists(email) {
        return knex('users')
            .select('list_id', 'list_name', 'date_created')
            .join('lists', 'users.user_id', '=', 'lists.user_id')
            .where({ email });
    }

    getUsersSharedLists(email) {
        return knex('users')
            .select('lists.list_id', 'list_name', 'date_created')
            .join('sharedlists', 'users.user_id', '=', 'sharedlists.user_id')
            .join('lists', 'sharedlists.list_id', '=', 'lists.list_id')
            .where({ email });
    }

}

module.exports = new Database();
