import React from 'react';
import { View, TextInput, Text, AsyncStorage } from 'react-native';
import _ from 'lodash'
import sha256 from 'sha256';
import styles from './../styles.js';
import backend from './../global/backend.js';
import { config, codes } from './../global/config.js';
import { primaryButton } from './../global/shared.js';

export default class SignUpScreen extends React.Component {
    static navigationOptions = { title: 'Sign Up' };

    constructor() {
        super();
        this.state = {
            errText: ' ',
            email: '',
            pw: '',
        };
    }

    signUp() {
        const { email, pw } = this.state;
        if (pw.length < 8) {
            setTimeout(() => this.setState({ errText: ' ' }), config.errUptime);
            this.setState({ errText: 'Password needs to be atleast 8' });
            return;
        }
        const pw_hash = sha256(this.state.pw);
        backend.registerUser(email, pw_hash)
            .then(res => {
                if (!_.isEqual(res.code, codes.success))
                    return Promise.reject(res.message);
            })
            .then(() => backend.requestSessionToken(email, pw_hash))
            .then(res => {
                if (!_.isEqual(res.code, codes.success))
                    return Promise.reject(res.message);
                return res.data.token;
            })
            .then(token => AsyncStorage.multiSet(_.toPairs({email, token})))
            .then(() => this.props.navigation.navigate('App'))
            .catch(message => {
                if (_.isEqual(typeof message, 'string')) {
                    setTimeout(() => this.setState({ errText: ' ' }), config.errUptime);
                    this.setState({ errText: message });
                } else {
                    console.log(message);
                }
            });
    }

    render = () => (
        <View style={styles.container}>
            <Text style={styles.errText}>{this.state.errText}</Text>
            <TextInput style={styles.textInput}
                underlineColorAndroid='transparent'
                placeholder='Email'
                keyboardType='email-address'
                value={this.state.email}
                onSubmitEditing={() => this.signUp()}
                onChangeText={email => this.setState({email})}
            />
            <TextInput style={styles.textInput}
                underlineColorAndroid='transparent'
                placeholder='Password'
                secureTextEntry={true}
                value={this.state.pw}
                onSubmitEditing={() => this.signUp()}
                onChangeText={pw => this.setState({pw})}
            />
            {primaryButton('Submit', () => this.signUp())}
        </View>
    );
}
