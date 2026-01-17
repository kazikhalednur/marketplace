'use client'
import { JitsiMeeting } from '@jitsi/react-sdk'

type Props = { room: string; jwt: string; domain: string }

export default function Meeting({ room, jwt, domain }: Props) {
    return (
        <JitsiMeeting
            domain={domain}
            roomName={room}
            jwt={jwt}
            configOverwrite={{
                startWithAudioMuted: true,
                startWithVideoMuted: true,
                prejoinPageEnabled: false,
                disableDeepLinking: true,
                disableInviteFunctions: true,
                disableReactions: true,
                disableChat: true,
            }}
            interfaceConfigOverwrite={{
                TOOLBAR_BUTTONS: [
                    'microphone',
                    'camera',
                    'desktop', // screen share
                    'raisehand',
                    'settings',
                    'hangup',
                    'recording', // participants see REC but cannot stop
                ],
                SETTINGS_SECTIONS: ['devices', 'language'],
                SHOW_JITSI_WATERMARK: false,
                SHOW_BRAND_WATERMARK: false,
                SHOW_POWERED_BY: false,
            }}
            getIFrameRef={(node) => {
                if (node) {
                    node.style.height = '100vh'
                    node.style.width = '100vw'
                }
            }}
        />
    )
}
