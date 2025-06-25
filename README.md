React & Node.js Skill Test Assignment

1. Successful Authentication

 No Comment

2. "Meeting" Feature (CRUD via RESTful API)

- Meetings List
- Adding new meetings.
- Editing existing meetings.
- Deleting single or multiple meetings at once.
- Advanced search box to filter meetings based on various criteria. 
- Detailed view pages for each meeting.
- Fixed bugs to improve data consistency and UI responsiveness.

3. Wallet Integration

To meet the requirement of maintaining the existing sign-in flow, I did not implement server-side wallet handling because that would require significant changes to the authentication process.

Currently, the wallet integration:

Connects the wallet on the client side.

Stores the wallet address in localStorage.

Validates that a wallet is connected before allowing the login submission.

However, this approach is not fully secure, as client-side validation alone can be bypassed.

Recommended Secure Approach for Wallet Integration
To securely integrate wallet authentication, updates are needed on both the client and server sides:

User Model Update:
Add two new fields to the user schema:

wallet (string) — to store the user’s wallet address.

nonce (string) — a randomly generated one-time string for signature verification.

Nonce Generation API:
Before logging in, the server generates and returns a unique nonce associated with the user’s wallet.

Wallet Signature Verification:
The client asks the user to sign the nonce message using their wallet. This signed message, along with username and password, is sent back to the server.

Server-side Verification:
Using cryptographic libraries like ethers.js, the backend verifies that the signature corresponds to the wallet address and nonce. Only when this check passes does the server authenticate the user and issue a JWT token.

This method securely proves ownership of the wallet and prevents spoofing, replay attacks, or unauthorized access. It aligns with best practices for decentralized identity authentication.