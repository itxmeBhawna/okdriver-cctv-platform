export default function LiveFeeds() {
    const feeds = [
        {
            camera_id: "C001",
            name: "Ahmedabad Traffic Junction",
            protocol: "RTSP (simulated)",
            src: "/videos/c001-feed.mp4",
        },
        {
            camera_id: "C002",
            name: "RTO Checkpoint Gandhinagar",
            protocol: "ONVIF (simulated)",
            src: "/videos/c002-feed.mp4",
        },
    ];

    return (
        <div className="p-6 space-y-5">
            <h1 className="text-2xl font-bold">Live Camera Feeds</h1>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg">
                These feeds are simulated using sample footage for this prototype. In production, each panel
                would connect to a real RTSP/ONVIF stream through a media gateway (e.g. an RTSP-to-WebRTC/HLS
                relay), with the same player interface shown below — only the source URL changes.
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {feeds.map((feed) => (
                    <div key={feed.camera_id} className="bg-white rounded-lg shadow overflow-hidden">
                        <video
                            src={feed.src}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full aspect-video bg-black object-cover"
                        />
                        <div className="p-3">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">{feed.camera_id} — {feed.name}</span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">● LIVE</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Protocol: {feed.protocol}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}