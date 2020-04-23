import { Component } from "react";
import io from "socket.io-client";
import fetch from "isomorphic-fetch";
import { Box, Container, Heading, Label, Input, Button } from "theme-ui";
import theme from "../lib/theme";

export default class InputForm extends Component {
  state = {
    username: "",
    currentUsers: [],
    submittedUsername: "",
    usernameRejected: false,
    allowStartGame: false,
    chameleonAssigned: false,
    gridAssigned: "",
  };

  componentDidMount() {
    this.socket = io(this.props.namespace);
    this.socket.on("connectedUsers", this.handleCurrentUsers);
    this.socket.on("acceptedUser", this.handleAcceptedUser);
    this.socket.on("rejectedUser", this.handleRejectedUser);
    this.socket.on("leftGame", this.handleLeftGame);
    this.socket.on("allowStartGame", this.handleAllowStartGame);
    this.socket.on("denyStartGame", this.handleDenyStartGame);
    this.socket.on("assignedGrid", this.handleAssignedGrid);
    this.socket.on("assignedChameleon", this.handleAssignedChameleon);
    console.log("getting server");
    fetch("/users")
      .then((value) => {
        return value.json();
      })
      .then((data) => {
        this.setState({ currentUsers: data });
      })
      .catch((err) => console.log(err));
  }

  componentWillUnmount() {
    this.socket.off("connectedUsers", this.handleCurrentUsers);
    this.socket.close();
  }

  handleAssignedChameleon = () => {
    this.setState({ chameleonAssigned: true });
  };

  handleAssignedGrid = (grid) => {
    this.setState({ gridAssigned: grid });
  };

  handleAllowStartGame = () => {
    if (!this.state.allowStartGame) {
      this.setState({ allowStartGame: true });
    }
  };

  handleDenyStartGame = () => {
    if (this.state.allowStartGame) {
      this.setState({ allowStartGame: false });
    }
  };

  handleLeftGame = (user) => {
    this.setState({ submittedUsername: "" });
  };

  handleCurrentUsers = (users) => {
    this.setState({ currentUsers: users });
  };

  handleAcceptedUser = (user) => {
    this.setState({ submittedUsername: user });
  };

  handleRejectedUser = () => {
    this.setState({ usernameRejected: true });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    // create user to send to socket
    if (this.state.username && this.state.username.length > 0) {
      this.socket.emit("user", this.state.username);
    }
  };

  handleChange = (event) => {
    this.setState({ username: event.target.value, usernameRejected: false });
  };

  handleLeaveGame = () => {
    this.socket.emit("leaveGame", this.state.username);
  };

  handleStartGame = () => {
    this.socket.emit("startGame");
  };

  isGameStarted = () => {
    return (
      this.state.chameleonAssigned ||
      (this.state.gridAssigned && this.state.gridAssigned.length > 0)
    );
  };

  render() {
    return (
      <>
        {!(this.state.submittedUsername.length > 0) && (
          <Box
            as="form"
            sx={{ py: [4, 5], color: "primary" }}
            onSubmit={this.handleSubmit}
          >
            <Container
              sx={{
                position: "relative",
                strong: { color: "accent" },
                "> p": { fontSize: [2, 3], maxWidth: "copyPlus", my: [2, 3] },
              }}
            >
              <Heading
                sx={{
                  variant: "text.subheadline",
                  fontSize: [3, 4],
                  color: "secondary",
                }}
              >
                Enter Game
              </Heading>
              <Label htmlFor="username">Username</Label>
              <Input
                name="username"
                mb={3}
                onChange={this.handleChange}
                value={this.state.username}
                sx={{
                  backgroundColor: this.state.usernameRejected ? "red" : null,
                }}
              />
              {this.state.usernameRejected && (
                <Label sx={{ color: "red", marginTop: "-15px", mb: "15px" }}>
                  That username is taken, please choose another
                </Label>
              )}
              <Button>Submit</Button>
            </Container>
          </Box>
        )}
        <Container sx={{ pb: [4, null, 5] }}>
          {((this.state.currentUsers && this.state.currentUsers.length > 0) ||
            (this.state.submittedUsername &&
              this.state.submittedUsername.length > 0)) && (
            <Heading
              sx={{
                variant: "text.subheadline",
                fontSize: [3, 4],
                color: "secondary",
              }}
            >
              Current Players
            </Heading>
          )}
          <Box
            as="ul"
            variant="list"
            sx={{
              ret: {
                display: "inline-block",
                fontFamily: "inherit",
                color: theme.colors.primary,
              },
            }}
          >
            {this.state.submittedUsername &&
              this.state.submittedUsername.length > 0 && (
                <ret>
                  <li key={this.state.submittedUsername}>
                    {this.state.submittedUsername}
                  </li>
                </ret>
              )}
            {this.state.currentUsers &&
              this.state.currentUsers.map((user) => {
                return user === this.state.submittedUsername ? null : (
                  <li key={user}>{user}</li>
                );
              })}
          </Box>
          {!this.isGameStarted() &&
            this.state.submittedUsername &&
            this.state.submittedUsername.length > 0 && (
              <Container sx={{ my: "10px" }}>
                <Box>
                  <Box as="ul" variant="list" sx={{ display: "flex" }}>
                    {this.state.allowStartGame && (
                      <Button
                        onClick={this.handleStartGame}
                        sx={{ marginRight: "10px" }}
                      >
                        Start Game
                      </Button>
                    )}
                    <Button onClick={this.handleLeaveGame}>Leave Game</Button>
                  </Box>
                </Box>
              </Container>
            )}
          {this.isGameStarted() && (
            <Container>
              <Box>
                {this.state.chameleonAssigned && <h1>You are the chameleon</h1>}
              </Box>
            </Container>
          )}
          {this.state.gridAssigned && this.state.gridAssigned.length > 0 && (
            <h1>{this.state.gridAssigned}</h1>
          )}
        </Container>
      </>
    );
  }
}