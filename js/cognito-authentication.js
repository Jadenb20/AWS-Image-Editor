const authenticate = (username, password) => {
    const authenticationData = {
        Username: username,
        Password: password,
    };

    const userPoolId = window._config.cognito.userPoolId; // Replace with your user pool ID
    const userClientPoolId = window._config.cognito.userPoolClientId; // Replace with your client pool ID

    AWS.config.region = _config.cognito.region;

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    const userPoolData = {
        UserPoolId: userPoolId,
        ClientId: userClientPoolId,
    };

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(userPoolData);
    const userData = {
        Username: authenticationData.Username,
        Pool: userPool,
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                const accessToken = result.getIdToken().getJwtToken();
                resolve(accessToken);
            },
            onFailure: (err) => {
                reject(err);
            },
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                // User must change password
                delete userAttributes.email_verified;
                delete userAttributes.email;

                const loginForm = document.getElementById('loginForm');
                const newPassForm = document.getElementById('loginPasswordConfirmationForm');
                loginForm.setAttribute('style', 'display: none;');
                newPassForm.setAttribute('style', 'display: inherit;');

                const newPassBtn = document.getElementById('newPassBtn');

                newPassBtn.addEventListener('click', () => {
                    const newPass = document.getElementById('cognito-new-password');
                    const newPassConfirmation = document.getElementById('cognito-new-password-2');
                    if (newPass.value === newPassConfirmation.value) {
                        cognitoUser.completeNewPasswordChallenge(newPass.value, userAttributes, {
                            onFailure: (err) => {
                                alert(err);
                                reject(err);
                            },
                            onSuccess: (result) => {
                                const accessToken = result.getAccessToken().getJwtToken();
                                newPassForm.setAttribute('style', 'display: none;');
                                loginForm.setAttribute('style', 'display: inherit;');
                                resolve(accessToken);
                            }
                        });
                    } else {
                        alert('Password doesn\'t match');
                    }
                });
            }
        });
    });
}