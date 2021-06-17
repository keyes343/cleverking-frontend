import React from 'react';
import {Box,Button,Container,Grid,Typography} from '@material-ui/core';

import { useState, useEffect,useContext } from 'react';
import {State_type,State_ctx,Dispatch_ctx,Dispatch_type, CustomButton} from '../Homepage';
import { t } from '../incoming';
import axios from 'axios';

export interface UserInterfaceProps {}

const UserInterface: React.FC<UserInterfaceProps> = () => {
    const { email,whichRoom } = useContext(State_ctx)!;

    return (
        <Container
            style={{ margin: '2rem auto auto' }}
        >
            <Typography
                style={{ fontSize: '1.2rem', margin: '1rem 0', opacity: '0.6' }}
            >
                You are logged in as USER - {email}
            </Typography>
             
             {/* ----------- conditional render ------- */}
             {
                 whichRoom === 'available' ?<AvailableRooms />:null
             }
        </Container>
    );
};

export default UserInterface;

const AvailableRooms = () => {
    const {allRooms} = useContext(State_ctx)!;

    const availableRooms = React.useMemo(() => {
        let rooms:t.room[] =[];
        if(allRooms){
            rooms = allRooms.filter(room => room.availability === true);
        };
        return rooms;
    },[allRooms])

    return(
        <Grid container style={{minHeight:'5rem' ,margin:'2rem 0 0'}} direction='column'>
            <TableHeader/>
            {
                availableRooms.map((room,i)=>{
                    return <Row availability={room.availability} room={room.name} key={i} />
                })
                // allRooms && allRooms.map((room,i)=>{
                //     return <Box style={{border:'2px solid'}}>
                //         {room.name}
                //     </Box>
                // })
            }
        </Grid>
    )
}

type RowProps = { 
    room: number;
    availability: boolean;
};

const Row = ({room, availability}:RowProps) => {

    const [bookingStatus, setBookingStatus] = useState<null|boolean>(null);
    const {aws,email} = useContext(State_ctx)!;
    
    useEffect(() => {
        if(bookingStatus === null){
            (async () => {
                const {data,status} = await axios.post(aws+'/rooms/check-self-availability',{name:room,email});
                if(status===200){
                    const {booked} = data;
                    setBookingStatus(booked);
                }
            })()
        }
    }, [aws, bookingStatus, email, room]);



    const btnNames = [
        // {
        //     value: 'username',
        //     width: '7rem',
        // },
        {
            value: room,
            width: '7rem',
        },
        {
            value: availability,
            width: '9rem',
        },
        {
            value: bookingStatus?'Booked':'Book now',
            width: '13rem',
        },
        // {
        //     name: bookingStatus?'Booked by self':'Available',
        //     width: '9rem',
        // },
    ]

    const unbook = async() => { 
        if(!email) {
            alert('You are not logged in to take this action.');
            return;
        }
        try {
            const {status,data} = await axios.post(aws+'/rooms/unbook',{name:room,email});
            console.log({status,data});
            if(status===200){
                setBookingStatus(false);
            }            
        } catch (error) {
            console.log({error})
        }
    } 
    const bookNow = async() => {
        if(!email) {
            alert('You are not logged in to take this action.');
            return;
        }
        try {
            const {status,data} = await axios.post(aws+'/rooms/book-now',{name:room,email});
            console.log({status,data});
            if(status===200){
                setBookingStatus(true);
            }
        } catch (error) {
            console.log({error})
        }
    }

    return(
        <Grid
            container
            item
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
                            backgroundColor: bookingStatus? 'lightblue' :''
                        }}
                    >
                        {i < 3 ? (
                            <Typography
                                style={{
                                    fontSize: '1.2rem',
                                    cursor:'default'
                                    // textAlign: 'center',
                                }}
                                onClick={()=>{
                                    if(btn.value === 'Book now'){
                                        bookNow();
                                    }else unbook();
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
                                    border: '2px solid blue',
                                    height: 'auto',
                                }}
                                // onClick={(e)=>btn.on_click?.(e)}
                            >
                                Book this
                            </Button>
                        )}
                    </Grid>
                );
            })}
        </Grid>
    )
}

const TableHeader = () => {
    const btnNames = [
        // {
        //     name: 'username',
        //     width: '7rem',
        // },
        {
            name: 'Room no.',
            width: '7rem',
        },
        {
            name: 'Availability',
            width: '9rem',
        },
        {
            name: 'Status',
            width: '13rem',
        },
    ];
    return (
        <Grid
            container
            item
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