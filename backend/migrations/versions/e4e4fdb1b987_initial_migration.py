"""Initial migration

Revision ID: e4e4fdb1b987
Revises: 
Create Date: 2024-08-25 23:34:53.617914

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e4e4fdb1b987'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=80), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_table('budget',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('category', sa.String(length=50), nullable=False),
    sa.Column('amount', sa.Float(), nullable=False),
    sa.Column('start_date', sa.Date(), nullable=False),
    sa.Column('end_date', sa.Date(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('expense',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('amount', sa.Float(), nullable=False),
    sa.Column('category', sa.String(length=50), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('description', sa.String(length=255), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('goal',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('target_amount', sa.Float(), nullable=False),
    sa.Column('current_amount', sa.Float(), nullable=True),
    sa.Column('deadline', sa.Date(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('profile',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('first_name', sa.String(length=50), nullable=True),
    sa.Column('last_name', sa.String(length=50), nullable=True),
    sa.Column('email', sa.String(length=100), nullable=False),
    sa.Column('phone', sa.String(length=15), nullable=True),
    sa.Column('currency', sa.String(length=3), nullable=True),
    sa.Column('language', sa.String(length=10), nullable=True),
    sa.Column('timezone', sa.String(length=50), nullable=True),
    sa.Column('two_factor_auth', sa.Boolean(), nullable=True),
    sa.Column('login_alerts', sa.Boolean(), nullable=True),
    sa.Column('password_expiry', sa.Integer(), nullable=True),
    sa.Column('avatar', sa.String(length=200), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('settings',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('notification_enabled', sa.Boolean(), nullable=True),
    sa.Column('theme', sa.String(length=20), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('settings')
    op.drop_table('profile')
    op.drop_table('goal')
    op.drop_table('expense')
    op.drop_table('budget')
    op.drop_table('user')
    # ### end Alembic commands ###
