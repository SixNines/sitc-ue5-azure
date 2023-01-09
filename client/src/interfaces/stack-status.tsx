export enum StackStatus {
    All="all",
    CreateComplete="create_complete",
    CreateInProgress="create_in_progress",
    CreateFailed="create_failed",
    DeleteComplete="delete_complete",
    DeleteFailed="delete_failed",
    DeleteInProgress="delete_in_progress",
    ReviewInProgress="review_in_progress",
    RollbackComplete="rollback_complete",
    RollbackFailed="rollback_failed",
    RollbackInProgress="rollback_in_progress",
    UpdateComplete="update_complete",
    UpdateCompleteCleanupInProgress="update_complete_cleanup_in_progress",
    UpdateFailed="update_failed",
    UpdateInProgress="update_in_progress",
    UpdateRollbackCompleted="update_rollback_complete",
    UpdateRollbackCompleteCleanupInProgress="update_rollback_complete_cleanup_in_progress",
    UpdateRollbackFailed="update_rollback_failed",
    UpdateRollbackInProgress="update_rollback_in_progress",
    ImportInProgress="import_in_progress",
    ImportComplete="import_complete",
    ImportRollbackInProgress="import_rollback_in_progress",
    ImportRollbackFailed="import_rollback_failed",
    ImportRollbackComplete="import_rollback_complete"

}