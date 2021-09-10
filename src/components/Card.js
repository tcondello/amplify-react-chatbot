import React from 'react';
import Amplify, { Interactions } from 'aws-amplify';
import awsconfig from '../aws-exports';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import SpaIcon from '@material-ui/icons/Spa';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

Amplify.configure(awsconfig);

const useStyles = makeStyles({
    chatSection: {
      width: '100%',
      height: '80vh'
    },
    messageArea: {
      height: '70vh',
      overflowY: 'auto'
    },
    bot: {
        backgroundColor: "#e0e0e0"
    },
    user: {
        backgroundColor: "#64b5f6"
    }
  });


export default function OutlinedCard() {   
    let [userInput, setUserInput] = React.useState('');
    let [messageList, setMessageList] = React.useState([]);
    let [thumbList, setThumbList] = React.useState([]);

    // This is from aws-exports.js --> aws_bots_config --> name
    const botName = "BookTrip_dev";
    const classes = useStyles();    

    const messagesRef = React.useRef(null);
    const scrollToBottom = () => {
        messagesRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",            
        });
    };

    React.useEffect(() => {
        if (messagesRef.current) {
          scrollToBottom();
        }
    }, [messageList]);

    async function sendMessage() {       
        setMessageList(messageList => [...messageList, {"type": "user", "message": userInput}])
        setUserInput('')
        const response = await Interactions.send(botName, userInput);
        // Get chatbot response
        setMessageList(messageList => [...messageList, {"type": "bot", "message": response.message}])
        setUserInput('')        
    }

    const thumbUp = function(idx){
        if(!thumbList.some(alreadyThumb => alreadyThumb.index === idx)){
            setThumbList(thumbList => [...thumbList, {"type": "ThumbUp", "message": messageList[idx], "index": idx}])            
        }
        
        console.log(thumbList)
    }

    const thumbDown = function(idx){
        if(!thumbList.some(alreadyThumb => alreadyThumb.index === idx)){
            setThumbList(thumbList => [...thumbList, {"type": "ThumbDown", "message": messageList[idx], "index": idx}])
        }
        console.log(thumbList)
    }

    const handleComplete = function (err, confirmation) {
        if (err) {
            setMessageList(messageList => [...messageList, {"type": "bot", "message": "bot conversation failed"}])
            // alert('bot conversation failed');
            return;
        }
        // alert('done: ' + JSON.stringify(confirmation, null, 2));     
        setMessageList(messageList => [...messageList, {"type": "bot", "message": "Trip booked. Thank you! What would you like to do next?"}])
        return;
    }
    
    Interactions.onComplete(botName, handleComplete );
    return (
        <div>
        <Grid container component={Paper} className={classes.chatSection}>
            <Grid item xs={12}>
                <List className={classes.messageArea}>
                    <ListItem key="initial">
                        <Grid container justifyContent="flex-start">
                            <ListItemAvatar>
                                <Avatar>
                                    <SpaIcon />
                                </Avatar>
                            </ListItemAvatar>                            
                            <Grid className={classes.bot} item xs={4}>
                                <ListItemText align="left" primary='Start by asking to "Book a trip" or "Rent a Car"'></ListItemText>
                            </Grid>
                        </Grid>
                    </ListItem>
                    {
                        messageList.map((bot_message, idx) => {
                            if(bot_message.type === "bot"){
                                return (
                                    <ListItem key={idx}>                                     
                                        <Grid container justifyContent="flex-start">
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <SpaIcon /> 
                                                </Avatar>
                                            </ListItemAvatar>                                            
                                            <Grid className={classes.bot} item xs={4}>
                                                <ListItemText align="left" primary={bot_message.message}></ListItemText>
                                            </Grid>
                                            <Grid item xs={3} align="left">
                                                <IconButton aria-label="Thumbs Up" onClick={thumbUp.bind(this, idx)}>
                                                    <ThumbUpIcon />
                                                </IconButton>
                                                <IconButton aria-label="Thumbs Down" onClick={thumbDown.bind(this, idx)}>
                                                    <ThumbDownIcon />
                                                </IconButton>
                                            </Grid>                                            
                                        </Grid>
                                        <div ref={messagesRef} />
                                    </ListItem>
                                )
                            }                            
                            return (
                                <ListItem key={idx}>                                   
                                    <Grid container justifyContent="flex-end">
                                        <ListItemAvatar>
                                            <Avatar>
                                                <AccountCircleIcon />
                                            </Avatar>
                                        </ListItemAvatar>                                         
                                        <Grid className={classes.user} item xs={4}>
                                            <ListItemText align="right" primary={bot_message.message}></ListItemText>
                                        </Grid>
                                    </Grid>
                                    <div ref={messagesRef} />
                                </ListItem>
                            )
                        })
                    }                 
                </List>
                <Divider />
                <Grid container>
                    <Grid item xs={11}>
                        <TextField id="user-input" label="Book a Trip" fullWidth 
                            inputProps={{
                                value: userInput,
                                onChange: ((event) => {
                                    const { value } = event.target;
                                    setUserInput(value);
                                }),
                                onKeyUp: ((event) => {
                                    if (event.key === 'Enter')
                                        sendMessage()
                                })
                            }}
                        
                        />
                    </Grid>
                    <Grid item xs={1} align="right">
                        <IconButton color="primary" aria-label="send" onClick={sendMessage}><SendIcon /></IconButton>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
      </div>
    );
}
