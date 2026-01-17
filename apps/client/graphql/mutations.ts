import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
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
