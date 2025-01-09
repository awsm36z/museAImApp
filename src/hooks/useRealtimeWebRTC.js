import { useEffect, useRef, useState } from 'react';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';
import { Platform, PermissionsAndroid } from 'react-native';

// 1) Define your local museum functions (same as script.js)
const fns = {
  locateBathroom: async () => {
    return "The nearest bathroom is located down this ramp to my right...";
  },
  getShowScheduleForLiveScienceStage: async () => {
    return {
      success: true,
      schedule: [
        // same data...
        {
          time: "11:30 AM",
          show: "Live Science Show",
          location: "Building 1, Live Science Stage",
          included: "Included in General Admission",
        },
        {
          time: "1:30 PM",
          show: "Live Science Show",
          location: "Building 1, Live Science Stage",
          included: "Included in General Admission",
        },
        {
          time: "3:30 PM",
          show: "Live Science Show",
          location: "Building 1, Live Science Stage",
          included: "Included in General Admission",
        },
      ],
    };
  },
  // ...the rest from script.js
  getShowScheduleForPlanetarium: async () => {/* ... */},
  getShowScheduleForIMAX: async () => {/* ... */},
  getShowScheduleForLaserShows: async () => {/* ... */},
  locateButterflyHouse: async () => {/* ... */},
  locateSpaceExhibit: async () => {/* ... */},
  locateTidepool: async () => {/* ... */},
};

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // ... add TURN servers here if necessary
  ],
};

/**
 * Custom hook that sets up a WebRTC PeerConnection, data channel, 
 * and mic capture, similar to script.js (browser).
 */
export function useRealtimeWebRTC() {
  const [status, setStatus] = useState('Idle');     // e.g. "Idle", "Connecting", "Connected", etc.
  const [messages, setMessages] = useState([]);     // If you want to store inbound text messages
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);

  // For playing remote audio, we might store the remote streams
  // or use state for them. You can attach them to an <RTCView> if needed.
  const [remoteStreams, setRemoteStreams] = useState([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  // 2) The main function to start WebRTC
  const startConnection = async () => {
    try {
      setStatus('Requesting permissions...');

      // Request mic permissions on Android explicitly
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setStatus('Microphone permission denied');
          return;
        }
      }

      setStatus('Creating peer connection...');
      // Create RTCPeerConnection
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      // -- Setup Data Channel (like script.js’s dataChannel) --
      const dataChannel = pc.createDataChannel('response');
      dataChannelRef.current = dataChannel;

      // When Data Channel opens, send the "session.update" config
      dataChannel.onopen = () => {
        console.log('Data channel opened');
        configureDataChannel();
      };

      // Listen for inbound messages (function calls, etc.)
      dataChannel.onmessage = handleDataChannelMessage;

      // If remote peer creates a data channel
      pc.ondatachannel = (event) => {
        console.log('Remote created data channel:', event.channel);
      };

      // 3) Handle inbound audio tracks
      pc.ontrack = (event) => {
        console.log('Remote track received:', event.streams);
        // For audio, you can let react-native-webrtc handle playback automatically,
        // or store the stream to attach to an <RTCView>.
        setRemoteStreams((prev) => [...prev, ...event.streams]);
      };

      // 4) Capture local microphone
      setStatus('Getting local mic stream...');
      const localStream = await mediaDevices.getUserMedia({ audio: true });
      // Add tracks to the PeerConnection
      localStream.getTracks().forEach((track) => {
        pc.addTransceiver(track, { direction: 'sendrecv' });
      });

      // 5) Create an offer
      setStatus('Creating offer...');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 6) Send the SDP offer to your /rtc-connect endpoint
      setStatus('Sending offer to server...');
      const response = await fetch('https://YOUR_SERVER/rtc-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: pc.localDescription.sdp,
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // 7) Get the SDP answer from your server
      const answerSDP = await response.text();
      setStatus('Applying remote description...');
      await pc.setRemoteDescription(
        new RTCSessionDescription({ sdp: answerSDP, type: 'answer' })
      );

      setStatus('Connected');
    } catch (err) {
      console.error(err);
      setStatus('Failed to connect');
    }
  };

  // 4) Called once dataChannel is open => “session.update”
  const configureDataChannel = () => {
    const event = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        tools: [
          { type: 'function', name: 'locateBathroom', description: '...' },
          { type: 'function', name: 'getShowScheduleForLiveScienceStage', description: '...' },
          { type: 'function', name: 'getShowScheduleForPlanetarium', description: '...' },
          { type: 'function', name: 'getShowScheduleForIMAX', description: '...' },
          { type: 'function', name: 'getShowScheduleForLaserShows', description: '...' },
          { type: 'function', name: 'locateButterflyHouse', description: '...' },
          { type: 'function', name: 'locateSpaceExhibit', description: '...' },
          { type: 'function', name: 'locateTidepool', description: '...' },
        ],
      },
    };
    dataChannelRef.current?.send(JSON.stringify(event));
  };

  // 5) Handle inbound Data Channel messages (e.g., function calls)
  const handleDataChannelMessage = async (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      console.log('Data channel received:', msg);

      // If the remote side is calling one of our local museum functions
      if (msg.type === 'response.function_call_arguments.done') {
        const fn = fns[msg.name];
        if (fn) {
          console.log(`Calling local function: ${msg.name}`);
          const args = msg.arguments ? JSON.parse(msg.arguments) : {};
          const result = await fn(args);

          // Send back the function_call_output
          const responseEvent = {
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: msg.call_id,
              output: JSON.stringify(result),
            },
          };
          dataChannelRef.current?.send(JSON.stringify(responseEvent));
        }
      } 
      // Else it might be a standard text message or some other event
      else if (msg.type === 'someOtherMessageType') {
        // handle accordingly
      }

      // You might also want to store text-based messages in state for your chat UI
      setMessages((prev) => [...prev, ev.data]);
    } catch (error) {
      console.log('Error parsing data channel message:', error);
    }
  };

  // 6) Helper to send manual text messages (if you want a chat input)
  const sendMessage = (text) => {
    if (!dataChannelRef.current) return;
    dataChannelRef.current.send(
      JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'text',
          content: text,
        },
      })
    );
  };

  // 7) Expose the relevant states and methods
  return {
    status,
    messages,
    remoteStreams,
    startConnection,
    sendMessage,
  };
}