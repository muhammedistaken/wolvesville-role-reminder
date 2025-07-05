import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Md from "./Markdown"
import { toast, Toaster } from "react-hot-toast"

const App = () => {

    const [roleCount, setRoleCount] = useState(16)
    const [types] = useState({
        villager: {
            img: "https://cdn.wolvesville.com/roleIcons/icon_default_random_villager_normal_filled.png"
        },
        werewolf: {
            img: "https://cdn.wolvesville.com/roleIcons/icon_default_random_werewolf_filled.png"
        },
        solo: {
            img: "https://cdn.wolvesville.com/roleIcons/icon_default_random_killer_filled.png"
        },
        random: {
            img: "https://cdn.wolvesville.com/roleIcons/icon_default_random_voting_filled.png"
        },
        unknown: {
            img: "https://cdn.wolvesville.com/roleIcons/icon_default_random_all_filled.png"
        }
    })
    const [roles, setRoles] = useState()
    const [roleList, setRoleList] = useState({ werewolf: 4, villager: 10, solo: 1, random: 1 })
    const [roleLeft, setRoleLeft] = useState()
    // claimer
    const [__claimer, setClaimer] = useState({ open: false, target: null })
    // info generator
    const [info, setInfo] = useState({
        config: {
            unknown: false
        },
        info: ""
    })

    // role types

    useEffect(() => { // --- SETTING ROLES ---
        if (roleCount) {
            const vill = new Array(roleCount).fill().map((_, id) => ({
                id: id + 1,
                role: "unknown",
                img: types.unknown.img
            }))
            setRoles(vill)
        }
    }, [roleCount])

    useEffect(() => {
        if (roleList) {
            setRoleLeft(roleList)
        }
    }, [roleList])

    useEffect(() => {
        if (roleLeft) {
            if (
                roleLeft.werewolf === 0 &&
                roleLeft.solo === 0 &&
                roleLeft.villager > 0
            ) { // vill win
                // vill win msg
            } else if (
                roleLeft.werewolf === roleLeft.villager &&
                roleLeft.random === 0
            ) { // ww equals vill
                if (roleLeft.solo === 0) { // if there is no solo and random, ww win
                    // ww win msg
                } else { // if there is solo
                    if (roleLeft.villager === 0) { // if 
                        // solo win msg
                    } else {
                        // alert ww and solo can win
                    }
                }
            } else if (
                roleLeft.villager === 0 &&
                roleLeft.solo === 0 &&
                roleLeft.random === 0 &&
                roleLeft.werewolf === 0
            ) { // if no vill and solo
                // equal ww and solo
            }
        }
        // info example: 1 is villager, 2 is werewolf, 3 is solo, 4 is random
        if (roleLeft) {
            let fakeInfo = "";
            Object.entries(roleLeft).forEach(role => {
                // console.log(role)
                if (roleList[role[0]] !== role[1]) {
                    // console.log('-- update -- ')
                    // console.log(roleList[role[0]] - role[1] + ' ' + role[0] + ' left')
                    // there is roleList[role[0]] - role[1] role left
                    // if (info.config[role[0]]) {
                    const filteredRoles = roles.filter(_role => _role.role === role[0])
                    if (filteredRoles) {
                        filteredRoles.forEach((_role, index) => {
                            // console.log(index + ' ' + filteredRoles.length)
                            fakeInfo += `${_role.id} ${_role.role} `
                        })
                    }
                    // }
                }
            })
            setInfo({ ...info, info: fakeInfo === '' ? 'No info' : sortAndMerge(fakeInfo) })
        }
        // console.log(roleLeft)

    }, [roleLeft])

    useEffect(() => { }, [roles])

    useEffect(() => { }, [__claimer])

    useEffect(() => {
        const clickOutSideHandle = e => {
            // console.log(e.composedPath())
            const players = [...document.querySelectorAll('.player')]
            let is = false
            for (let player of players) {
                // console.log([e.composedPath(), player, __claimer.open, player.querySelector('.claimer')])
                if (!e.composedPath().includes(player) && player.querySelector('.claimer')) {
                    setClaimer({ open: false, target: null })
                    break;
                }
                continue;
            }
        }

        document.addEventListener('click', clickOutSideHandle)

        return () => {
            document.removeEventListener('click', clickOutSideHandle)
        }
    }, [])

    const preventer = e => {
        e.preventDefault()
        return false;
    }

    function sortAndMerge(input) {
        const items = input.split(' ');
        const result = [];

        for (let i = 0; i < items.length; i += 2) {
            if (i + 1 < items.length) {
                const num = parseInt(items[i], 10);
                const name = items[i + 1];
                if (!isNaN(num)) {
                    result.push([num.toString(), name]);
                } else {
                    result.push([items[i], items[i + 1]]);
                }
            } else {
                result.push([items[i]]);
            }
        }

        if (result.length > 1) {
            result.sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10));
        }

        const mergedResult = result.map(arr => arr.join(' '));
        return mergedResult.join(', ').slice(0, -2).replace(/villager/g, 'safe');
    }


    const claimHandle = id => openClaimer(id)

    const openClaimer = id => {
        if (__claimer.open && !__claimer.timeOut) {
            if (__claimer.target === id) {
                return
            }
            setClaimer({ open: false, target: null, timeOut: true })
            setClaimer({ open: true, target: id })
        } else if (!__claimer.open && !__claimer.timeOut) {
            setClaimer({ open: true, target: id })
        }
    }

    const selectClaim = (id, role, current) => {
        let newRoleLeft = roleLeft
        if (role !== 'unknown') {
            newRoleLeft = { ...roleLeft, [role]: roleLeft[role] - 1 }
        }
        if (current !== 'unknown') {
            // newRoleLeft[current] = newRoleLeft[current] + 1
            newRoleLeft = { ...newRoleLeft, [current]: newRoleLeft[current] + 1 }
        }
        const newRoles = roles
        newRoles[id - 1] = { id, role, img: types[role].img }
        setRoleLeft(newRoleLeft)
        setRoles(newRoles)
        setClaimer({ open: false, target: null })
    }

    const isDoneRole = (type = 'all') => {
        if (type === 'unknown') return false
        if (type === 'all') {
            const notDone = Object.entries(roleLeft).filter(role => role[1] !== 0)
            return notDone.length
        }
        if (roleLeft[type] === undefined) return console.error(`there is no "${type}"`)
        if (roleLeft[type] === 0) return true;
        return false
    }

    const Claimer = ({ id, selectClaim }) => {
        return (
            <div data-items={isDoneRole('all')} className="claimer">
                {types && Object.entries(types).map((type, index) => {
                    if (isDoneRole(type[0])) return null
                    if (roles[id - 1].role === type[0]) return null
                    return (
                        <button
                            onClick={() => selectClaim(id, type[0], roles[id - 1]['role'])}
                            disabled={isDoneRole(type[0])}
                            key={index}
                            className="flex disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <img
                                onDragStart={preventer}
                                onContextMenu={preventer}
                                src={type[1].img}
                                alt={type[0]}
                            />
                        </button>
                    )
                })}
            </div>
        )
    }

    return (
        <>
            <Toaster
                position="bottom-center"
                reverseOrder={false}
            />
            <header className="items-center flex border-b h-16 p-2 w-full border-[#b4c6ef4d]">
                <div className="items-center inline-flex justify-start w-1/2">
                    {/* boş */}
                </div>
                <div className="items-center inline-flex mx-2 justify-center flex-shrink-0">
                    <h1 className="font-semibold normal-case text-base sm:text-3xl select-none">
                        Wolvesville Role Reminder
                    </h1>
                </div>
                <div className="w-1/2 justify-end inline-flex items-center">

                </div>
            </header>
            <motion.main
                className="mx-auto w-screen max-w-4xl"
            >
                <motion.ul
                    variants={{
                        hidden: { opacity: 1, scale: 0 },
                        visible: {
                            opacity: 1,
                            scale: 1,
                            transition: {
                                // delayChildren: 0.3,
                                staggerChildren: 0.2
                            }
                        }
                    }}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap gap-4 mt-5"
                >
                    {roles && roles.map(_ => (
                        <motion.li
                            variants={{
                                hidden: { y: 20, opacity: 0 },
                                visible: {
                                    y: 0,
                                    opacity: 1
                                }
                            }}
                            onClick={() => claimHandle(_.id)}
                            onDragStart={preventer}
                            onContextMenu={preventer}
                            key={_.id}
                            className={`player ${_.role}`}
                        >
                            {__claimer.open && __claimer.target === _.id && <Claimer selectClaim={selectClaim} id={_.id} />}
                            <div className="w-100 flex justify-center items-center py-2">
                                <img src={_.img} alt={_.role} className="aspect-[1/1] w-[75px]" />
                            </div>
                            <div className="w-100 block text-center font-bold capitalize">
                                <span>{_.id}.</span> {_.role}
                            </div>
                        </motion.li>
                    ))}
                </motion.ul>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-10"
                >
                    <h1 className="font-semibold text-[2em] leading-tight">Statistics</h1>
                    <div className="mt-5">
                        <div className="flex flex-wrap w-full bg-[#0b0d0f] p-4 rounded-lg justify-around select-none">
                            {roleLeft && Object.entries(roleLeft).map((role, index) => (
                                <div key={index} className={`${role[1] === 0 ? 'opacity-30' : ''} flex flex-col items-center w-1/4 hover:bg-gray-500 p-3 rounded-lg transition-all bg-opacity-30`}>
                                    <div className="w-[75px] h-[75px] aspect-[1/1] flex justify-center items-center">
                                        <img onDragStart={preventer} onContextMenu={preventer} src={types[role[0]].img} alt={role[0]} />
                                    </div>
                                    <div className="mt-2 text-center">
                                        <span className="font-bold">{role[1]}</span> {role[0]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-10"
                >
                    <h1 className="font-semibold text-[2em] leading-tight">Info</h1>
                    <p>
                        <strong>p.s.</strong> you can copy the info by clicking on it.
                    </p>
                    <div className="mt-5">
                        <textarea
                            type="text"
                            className="w-full p-3 rounded-lg bg-[#0b0d0f] text-white cursor-pointer resize-none"
                            placeholder="Info"
                            value={info.info}
                            readOnly
                            onClick={() => {
                                try{
                                    navigator.clipboard.writeText(info.info)
                                    toast.success((t) => (
                                        <div className="flex transition-all items-center rounded-lg">
                                            Info copied to clipboard.
                                            <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 h-full bg-[#ff0000] text-[#f1f3f5] rounded ml-2">Close</button>
                                        </div>
                                    ), {duration: 2000})
                                }catch(e){
                                    toast.error('Cannot copy the info.')
                                }
                            }}
                        ></textarea>
                    </div>
                </motion.div>

                <div className="mt-10">
                    <Md children={`
# Why this app?

This app is created for the game called [Wolvesville](https://www.wolvesville.com/).
It is a game that you can play with your friends. You can play it on your phone or on your computer.
**This app is created for the computer version of the game.**
This app is designed to take notes of the given **infos** and use them to **quickly win** the game by making informed decisions.
                    `} />
                </div>
            </motion.main>
            <footer className="mt-20 pb-5 w-full bg-gradient-to-t from-blue-600/5 to-transparent">
                <div className="flex justify-center items-center h-16 flex-col">
                    <p>This application is not affiliated and supported with Wolvesville INC.</p>
                    <small>by <a className="text-blue-600" href="https://github.com/muhammedistaken">muhammedd.tsx</a></small>
                </div>
            </footer>
        </>
    )
}

export default App
