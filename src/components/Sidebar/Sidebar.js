import styles from './Sidebar.module.css';
import { getGroupInitials } from '../../utils/groupInitials';

function TrashIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 7h12v2H6V7Zm2 3h8l-1 11H9L8 10Zm3-6h2l1 1h5v2H5V5h5l1-1Z"
      />
    </svg>
  );
}

export function Sidebar({
  groups,
  activeGroupId,
  onSelectGroup,
  onOpenCreateGroup,
  onDeleteGroup,
  onDeleteAllGroups,
  isMobile = false,
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div>Pocket Notes</div>
        {groups.length > 0 ? (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={onDeleteAllGroups}
            aria-label="Delete all groups"
            title="Delete all groups"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className={styles.groups}>
        {isMobile && groups.length === 0 ? (
          <div className={styles.emptyState} aria-hidden="true">
            <img
              className={styles.emptyImg}
              src={`${process.env.PUBLIC_URL}/home-illustration.svg`}
              alt=""
            />
          </div>
        ) : null}
        {groups.map((group) => {
          const isActive = group.id === activeGroupId;
          return (
            <div
              key={group.id}
              className={`${styles.groupRow} ${isActive ? styles.active : ''}`}
              role="presentation"
            >
              <button
                type="button"
                className={styles.groupBtn}
                onClick={() => onSelectGroup(group.id)}
              >
                <div
                  className={styles.avatar}
                  style={{ backgroundColor: group.color }}
                  aria-hidden="true"
                >
                  {getGroupInitials(group.name)}
                </div>
                <div className={styles.groupName}>{group.name}</div>
              </button>
              <div
                className={styles.rightActions}
                onClick={(e) => e.stopPropagation()}
                role="presentation"
              >
                <button
                  type="button"
                  className={styles.deleteGroupBtn}
                  onClick={() => onDeleteGroup(group.id)}
                  aria-label={`Delete group ${group.name}`}
                  title="Delete group"
                >
                  <TrashIcon className={styles.trashIcon} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.fab}
        onClick={onOpenCreateGroup}
        aria-label="Create group"
      >
        +
      </button>
    </aside>
  );
}

