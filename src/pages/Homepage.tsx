/* eslint-disable react/jsx-pascal-case */
import * as React from 'react';
import {
    useState,
    useEffect,
    useMemo,
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
} from 'react';
import { Box, Button, Container, Grid, Typography } from '@material-ui/core';
// import styles from './Homepage.module.scss';
import { t } from './incoming';
import axios from 'axios';
import './styles.scss';
import UserInterface from './Homepage/UserInterface';

export interface HomepageProps {}

// --- STATE
export type State_type = {
    loggedIn: false | 'user' | 'admin';
    email: string | null;
    whichRoom: 'available'|'booking';
    allRooms: t.room[]|null;
    aws:string
};

export const State_ctx = createContext<State_type | null>(null);

// --- DISPATCH
export type Dispatch_type = {
    set_loggedIn: Dispatch<SetStateAction<false | 'user' | 'admin'>>;
    set_email: Dispatch<SetStateAction<string>>;
    set_whichRoom: Dispatch<SetStateAction<'available'|'booking'>>;
    set_allRooms: Dispatch<SetStateAction<null | t.room[]>>;
};
export const Dispatch_ctx = createContext<Dispatch_type|null>(null);

const Homepage = () => {
    const [loggedIn, set_loggedIn] = useState<'user' | 'admin' | false>('user');
    const [email, set_email] = useState('null@some.com');
    const [googleId, set_googleId] = useState(null);
    const [whichRoom, set_whichRoom] = useState<'available'|'booking'>('available');
    const [allRooms, set_allRooms] = useState<t.room[] | null>(null);
    // const aws = 'https://chde3qurk0.execute-api.ap-south-1.amazonaws.com/dev'; // verified for cleverKings
    const aws = 'http://localhost:5000';

    useEffect(() => {
        if (!allRooms) {
            console.log('Attempting to ------ AAAAAAAAAA -------');
            (async () => {
                try {
                    const { data, status } = await axios.get(
                        aws+'/rooms/get-list'
                    );
                    console.log({ data, status });
                    set_allRooms([...data.docs])
                } catch (error) {
                    console.log({ error });
                }
            })();
        }
    }, [allRooms]);

    const stateMemo = useMemo(() => {
        const newState: State_type = {
            loggedIn,
            email,
            whichRoom,
            allRooms,
            aws
        };
        return newState;
    }, [loggedIn, email, whichRoom, allRooms]);

    const dispatchMemo = useMemo(() => {
        const newDispatch: Dispatch_type = {
            set_loggedIn,
            set_email,
            set_whichRoom,
            set_allRooms,
        };
        return newDispatch;
    }, []);

    return (
        <State_ctx.Provider value={stateMemo}>
            <Dispatch_ctx.Provider value={dispatchMemo}>
                <Heading />
                {loggedIn === 'user' ? (
                    <UserInterface />
                ) : (
                    loggedIn === 'admin' && <AdminInterface />
                )}
            </Dispatch_ctx.Provider>
        </State_ctx.Provider>
    );
};

export default Homepage;

// -------------- children - HEADING

export interface HeadingProps {}

const Heading: React.FC<HeadingProps> = () => {
    const { loggedIn } = useContext(State_ctx)!;
    const { set_loggedIn } = useContext(Dispatch_ctx)!;

    useEffect(() => {
        console.log({ loggedIn });
    }, [loggedIn]);

    const buttons = [
        {
            text: 'Admin Login',
            on_click: () => {
                console.log('Admin btn clicked');
                set_loggedIn('admin');
            },
        },
        {
            text: 'User Login',
            on_click: () => {
                console.log('User btn clicked');
                set_loggedIn('user');
            },
        },
    ];
    return (
        <Grid
            container
            justify="center"
            className={'heading'}
            // onClick={() => {
            //     console.log('clicked --- yes ');
            //     set_loggedIn(!loggedIn);
            // }}
        >
            <Grid
                container
                item
                justify="space-around"
                 
            >
                {buttons.map((btn, i) => {
                    return (
                        <Grid key={i} xs={5} item container justify="center">
                            <Button
                                className="btn"
                                onClick={() => btn.on_click()}
                            >
                                {btn.text}
                                {/* <Typography className="text">
                                </Typography> */}
                            </Button>
                        </Grid>
                    );
                })}
            </Grid>
        </Grid>
    );
};

// -------------- children - USERINTERFACE | ADMININTERFACE





// -------------- children - USERINTERFACE | ADMININTERFACE

export interface AdminInterfaceProps {}

const AdminInterface: React.FC<AdminInterfaceProps> = () => {
    const { email,aws,allRooms } = useContext(State_ctx)!;
    const {set_allRooms} = useContext(Dispatch_ctx)!;


    const addRoom = async() => {
        console.log('adding room');
        try {
            const {status,data} = await axios.get(aws+'/rooms/add-room');
            if(status===200){
                // hard refreshing from state
                console.log({doc:data.doc})
                if(!allRooms){
                    set_allRooms([...data.doc]);                    
                }else{
                    set_allRooms([...allRooms,data.doc])
                }
            }            
        } catch (error) {
            console.log({error})
        }
    }

    useEffect(() => {
        console.log({
            allRooms
        })
    }, [allRooms]);

    return (
        <Container
            style={{ margin: '2rem auto auto' }}
        >
            <Typography
                style={{ fontSize: '1.2rem', margin: '1rem 0', opacity: '0.6' }}
            >
                You are logged in as ADMIN - {email}
            </Typography> 
            <TableHeader />
            {
                !!allRooms && allRooms.map((room,i)=>{
                    return(
                        <Row key={i} username={room.userEmail??''} room={room.name} availability={room.availability} />

                    )
                })
            }

            <Box style={{margin:'2rem 0 0'}}>
                <Button style={{border:'2px solid grey'}} onClick={addRoom} >
                    Add 1 room
                </Button>
            </Box>
        </Container>
    );
};

// ----------- helpers

type CustomButtonProps = {
    name: string;
    on_click: (e: any) => void;
};

export const CustomButton = ({ name, on_click }: CustomButtonProps) => {
    return <Button onClick={(e) => on_click(e)}>{name}</Button>;
};

const TableHeader = () => {
    const btnNames = [
        {
            name: 'username',
            width: '7rem',
        },
        {
            name: 'Room no.',
            width: '7rem',
        },
        {
            name: 'Availability',
            width: '9rem',
        },
    ];
    return (
        <Grid
            container
            direction="row"
            justify="flex-start"
            style={{ gap: '0.5rem',margin:'2rem 0' }}
        >
            {btnNames.map((btn, i) => {
                return (
                    <Grid
                        item
                        container
                        // justify="center"
                        key={i}
                        style={{ 
                            width: btn.width,
                        }}
                    >
                        <Typography
                            style={{
                                fontSize: '1.2rem',
                                // textAlign: 'center',
                            }}
                        >
                            {btn.name}
                        </Typography>
                    </Grid>
                );
            })}
        </Grid>
    );
};

type RowProps = {
    username: string;
    room: number;
    availability: boolean;
};
const Row = ({ username, room, availability }: RowProps) => {
    const {aws,allRooms} = useContext(State_ctx)!;
    const {set_allRooms} = useContext(Dispatch_ctx)!;
    const btnNames = [
        {
            value: username,
            width: '7rem',
        },
        {
            value: room,
            width: '7rem',
        },
        {
            value: availability,
            width: '9rem',
        },
        {
            value: 'Toggle Availability',
            width: '15rem',
            on_click: async(e:any) => {
                // toggle availability of the respective button 
                try {
                    const {status,data} = await axios.post(aws+'/rooms/toggle-room',{
                        name: room
                    });
                    console.log({status,data})
                    if(status === 200) {
                        if(data && allRooms){ 
                            const newDoc = data.doc;
                            const index = allRooms.findIndex((room)=> room.name === data.doc.name);
                            const aa = [...allRooms];
                            if(data.msg === 'deleted'){
                                aa[index].availability = false;   
                            }else if(data.msg === 'added'){
                                aa[index].availability = true;   
                            }
                            set_allRooms([...aa]);
                        }

                    }else{
                        alert('Some error occured, please refresh again');
                    }
                } catch (error) {
                    console.log(error)
                }

            },
        },
    ];
    return (
        <Grid
            container
            direction="row"
            justify="flex-start"
            style={{ gap: '0.5rem' }}
        >
            {btnNames.map((btn, i) => {
                return (
                    <Grid
                        item
                        container
                        // justify="center"
                        key={i}
                        style={{ 
                            width: btn.width,
                        }}
                    >
                        {i < 3 ? (
                            <Typography
                                style={{
                                    fontSize: '1.2rem',
                                    // textAlign: 'center',
                                }}
                            >
                                {btn.value === true
                                    ? 'Yes'
                                    : btn.value === false
                                    ? 'No'
                                    : btn.value}
                            </Typography>
                        ) : (
                            <Button
                                style={{ 
                                    height: 'auto',
                                }}
                                onClick={(e)=>btn.on_click?.(e)}
                            >
                                Toggle Availability
                            </Button>
                        )}
                    </Grid>
                );
            })}
        </Grid>
    );
};

