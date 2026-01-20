import { gql } from "@apollo/client";

// We pass 'type: "DRIVER"' to tell the backend which door we are knocking on.
// If you named the argument 'appType' in your backend, change 'type' to 'appType' below.
export const DRIVER_LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!, $pushToken: String) {
    login(
      email: $email
      password: $password
      appType: "DRIVER"
      pushToken: $pushToken
    ) {
      token
      user {
        id
        email
        fullName
        roles # Useful for debugging
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $fullName: String!) {
    signup(
      email: $email
      password: $password
      fullName: $fullName
      role: "DRIVER"
    ) {
      token
      user {
        id
        email
        fullName
      }
    }
  }
`;

export const ACCEPT_RIDE_MUTATION = gql`
  mutation AcceptRide($rideId: String!, $driverId: String!) {
    acceptRide(rideId: $rideId, driverId: $driverId) {
      id
      status
      user {
        fullName
        phone
      }
      originLat
      originLng
      destLat
      destLng
    }
  }
`;

export const UPDATE_PUSH_TOKEN_MUTATION = gql`
  mutation UpdatePushToken($token: String!) {
    updatePushToken(token: $token) {
      id
      pushToken
    }
  }
`;
