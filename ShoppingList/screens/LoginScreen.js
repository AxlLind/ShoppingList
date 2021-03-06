import React, { Component } from 'react';
import { View, TextInput, Text, AsyncStorage } from 'react-native';
import _ from 'lodash';
import { config, codes } from './../global/config.js';
import styles from './../styles.js';
import backend from './../global/backend.js';
import { primaryButton, secondaryButton } from './../global/shared.js';
import sha256 from 'sha256';

export default class LoginScreen extends Component {
    static navigationOptions = { title: 'Login' };

    constructor(props) {
        super(props);
        this.state = {
            errText: ' ',
            email: '',
            pw: '',
        };
    }

    componentDidMount() {
        AsyncStorage.getItem('email')
            .then(email => this.setState({email}))
            .catch(console.log);
    }

    login() {
        const {email, pw} = this.state;
        backend.requestSessionToken(email, sha256(pw))
            .then(res => {
                if (res.code !== codes.success)
                    return Promise.reject(res.message);
                return res.data.token;
            })
            .then(token => AsyncStorage.multiSet(_.toPairs({ email, token })))
            .then(() => this.props.navigation.navigate('ListViewer'))
            .catch(message => {
                setTimeout(() => this.setState({ errText: ' ' }), config.errUptime);
                this.setState({ errText: message });
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
                onSubmitEditing={() => this.login()}
                onChangeText={email => this.setState({email})}
            />
            <TextInput style={styles.textInput}
                underlineColorAndroid='transparent'
                placeholder='Password'
                secureTextEntry={true}
                value={this.state.pw}
                onSubmitEditing={() => this.login()}
                onChangeText={pw => this.setState({pw})}
            />
            {primaryButton('Submit', () => this.login())}
            {secondaryButton('Sign Up', () => this.props.navigation.navigate('SignUp'))}
        </View>
    );
}
