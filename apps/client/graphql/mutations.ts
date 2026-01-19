import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password, appType: "RIDER") {
      token
      user {
        id
        email
        fullName
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $fullName: String!) {
    signup(email: $email, password: $password, fullName: $fullName) {
      token
      user {
        id
        email
        fullName
      }
    }
  }
`;

// 1. BOOKING MUTATION
export const BOOK_INSTANT_RIDE_MUTATION = gql`
  mutation BookInstantRide($input: CreateRideInput!) {
    bookInstantRide(createRideInput: $input) {
      id
      status
    }
  }
`;

// 2. STATUS POLLING QUERY
export const GET_RIDE_STATUS = gql`
  query GetRideStatus($id: String!) {
    getRide(id: $id) {
      id
      status
      rideOtp
      price
      driver {
        id
        fullName
      }
    }
  }
`;
