import React from 'react'
import { Modal } from 'react-bootstrap-v5'
import { getFormattedMessage } from '../../shared/sharedMethod'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKeyboard } from '@fortawesome/free-solid-svg-icons'

export default function ShortcutsInfoModel({ IsShortcutsModel, setIsShortcutsModel, settings }) {
    const shortcutKeys = [
        { key: 'F1', value: settings?.attributes?.pos_shortcut_f1 },
        { key: 'F2', value: settings?.attributes?.pos_shortcut_f2 },
        { key: 'F3', value: settings?.attributes?.pos_shortcut_f3 },
        { key: 'F4', value: settings?.attributes?.pos_shortcut_f4 },
        { key: 'F5', value: settings?.attributes?.pos_shortcut_f5 },
    ]

    return (
        <Modal
            show={IsShortcutsModel}
            onHide={() => setIsShortcutsModel(false)}
            size="md"
            className="pos-modal">
            <Modal.Header className="pt-3 pb-0 border-b-0">
                <div className="w-100 text-center">
                    <FontAwesomeIcon icon={faKeyboard} className="fs-4"/>
                    <h3>ShortCut Key Details</h3>
                </div>
            </Modal.Header>
            <Modal.Body className='pt-1'>
                <div className="">
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th>{getFormattedMessage("key.lable")}</th>
                                <th className='text-end pe-5'>{getFormattedMessage("key.value.lable")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shortcutKeys.map((shortcut, index) => (
                                <tr key={index}>
                                    <td className="fw-medium">{shortcut.key}</td>
                                    <td className='text-end pe-5'>{shortcut.value || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal.Body>
        </Modal>
    )
}
