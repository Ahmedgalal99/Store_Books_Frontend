import ActionButton from '../ActionButton/ActionButton'
import pencil from '../../assets/Pencil.png'
import trash from '../../assets/Bin.png'

const TableActions = ({ row, onEdit, onDelete, disabled = false }) => {
  if (disabled) {
    return (
      <div className="flex space-x-2">
        <button
          disabled
          className="p-2 rounded opacity-50 cursor-not-allowed"
          title="Sign in to edit"
        >
          <img src={pencil} alt="Edit" className="w-4 h-4" />
        </button>
        <button
          disabled
          className="p-2 rounded opacity-50 cursor-not-allowed"
          title="Sign in to delete"
        >
          <img src={trash} alt="Delete" className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      {onEdit && (
        <ActionButton
          icon={pencil}
          action={() => onEdit(row)}
        />
      )}
      {onDelete && (
        <ActionButton
          icon={trash}
          action={onDelete}
          className="bg-red-500 hover:bg-red-600"
        />
      )}
    </div>
  )
}
export default TableActions;