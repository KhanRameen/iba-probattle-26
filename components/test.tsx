"use client"

export function TestButton() {
    console.log("TestButton rendering!")

    return (
        <button
            onClick={() => {
                console.log("Button clicked!")
                alert("Client JS is working!")
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
        >
            Test Client Component
        </button>
    )
}