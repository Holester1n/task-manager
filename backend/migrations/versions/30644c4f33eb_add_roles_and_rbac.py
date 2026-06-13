"""add roles and rbac

Revision ID: 30644c4f33eb
Revises: a1b2c3d4e5f6
Create Date: 2026-06-13 22:56:58.885718

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '30644c4f33eb'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'roles',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
    )

    op.create_table(
        'role_system_access',
        sa.Column('role_id', sa.Integer(), sa.ForeignKey('roles.id'), primary_key=True),
        sa.Column('system_id', sa.Integer(), sa.ForeignKey('systems.id'), primary_key=True),
    )

    op.add_column('users', sa.Column('role_id', sa.Integer(), sa.ForeignKey('roles.id'), nullable=True))

    op.drop_column('users', 'role')


def downgrade() -> None:
    op.add_column('users', sa.Column('role', sa.VARCHAR(length=10), nullable=True))
    op.drop_column('users', 'role_id')
    op.drop_table('role_system_access')
    op.drop_table('roles')