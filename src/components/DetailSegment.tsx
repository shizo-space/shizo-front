import { useState, FC } from 'react'
import './DetailSegment.css'
import useEvmWallet from '../adaptors/evm-wallet-adaptor/useEvmWallet'

type DetailSegmentProps = {
  name: string
  loading: boolean
  onChangeName: (newName: string) => any
}

export const DetailSegment: FC<DetailSegmentProps> = ({ name, onChangeName, loading }) => {
  const [showChangeNameInput, setShowChangeNameInput] = useState(false)
  const [newName, setNewName] = useState(name)
  const { connectWallet, isWalletConnectedToSite } = useEvmWallet()

  const handleOnNameClick = () => {
    setShowChangeNameInput(true)
  }

  const handleOnInputBlur = () => {
    setShowChangeNameInput(false)
  }

  const handleOnInputChange = _name => {
    setNewName(_name)
  }

  return (
    <div className="fixed top-0 left-0 detail-segment-container bg-white">
      <div className="w-full h-full p-4 flex flex-col justify-start items-left">
        <div className="w-full pt-8">
          <input type="text" placeholder="Search Address" className="px-4 w-full" />
        </div>
        <div className="flex flex-col justify-between items-center py-4 px-4 mt-12">
          {showChangeNameInput ? (
            <div>
              <input
                autoFocus
                type="text"
                placeholder={name}
                className="px-4 w-full my-8"
                onBlur={() => handleOnInputBlur()}
                onChange={event => handleOnInputChange(event.target.value)}
              />
            </div>
          ) : (
            <div className="text-lg font-semibold my-8" onClick={() => handleOnNameClick()}>
              {name}
            </div>
          )}
          {name && name !== '' ? (
            <div className="text-base">
              <button onClick={() => onChangeName(newName)} disabled={loading}>
                Change Name
              </button>
            </div>
          ) : null}

          <div className="text-base">
            {isWalletConnectedToSite ? (
              <button onClick={() => ({})}>Sign out</button>
            ) : (
              <button onClick={() => connectWallet()}>Sign In</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
